import {
	NodeConnectionTypes,
	NodeOperationError,
	type IExecuteFunctions,
	type IDataObject,
	type INodeExecutionData,
	type INodeProperties,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';
import {
	FastlaneClient,
	type ContentType,
	type ContentStatus,
	type PostStatus,
	type Platform,
} from 'usefastlane-api';

const OPERATIONS = [
	['Cancel Posts', 'cancelPosts', 'Cancel scheduled posts', 'Cancel posts'],
	['Create Angle', 'createAngle', 'Create a new content angle', 'Create angle'],
	['Delete Angle', 'deleteAngle', 'Delete a content angle', 'Delete angle'],
	['Delete Content', 'deleteContent', 'Delete a content item', 'Delete content'],
	['Get Angles', 'getAngles', 'Get all content angles', 'Get angles'],
	['Get Connections', 'getConnections', 'Get connected social accounts', 'Get connections'],
	['Get Content', 'getContent', 'Get content items from the library', 'Get content items'],
	['Get Content by ID', 'getContentById', 'Get a specific content item', 'Get content by ID'],
	['Get Post Analytics', 'getPostAnalytics', 'Get engagement metrics for posts', 'Get post analytics'],
	['Get Post by ID', 'getPostById', 'Get a specific post', 'Get post by ID'],
	['Get Posts', 'getPosts', 'Get scheduled and posted posts', 'Get posts'],
	['Get Preferences', 'getPreferences', 'Get discovery queue preferences', 'Get preferences'],
	['Pop Blitz', 'popBlitz', 'Generate new content from the discovery queue', 'Pop a blitz from the discovery queue'],
	['Schedule Content', 'scheduleContent', 'Schedule content for posting', 'Schedule content'],
	['Update Angle', 'updateAngle', 'Update an existing content angle', 'Update angle'],
	['Update Preferences', 'updatePreferences', 'Update discovery queue preferences', 'Update preferences'],
] as const;

type Operation = (typeof OPERATIONS)[number][1];

type Handler = (
	ctx: IExecuteFunctions,
	client: FastlaneClient,
	itemIndex: number,
) => Promise<unknown>;

const showFor = (...operations: Operation[]) => ({
	show: {
		operation: operations,
	},
});

const percentOptions = {
	minValue: 0,
	maxValue: 100,
};

const p = <T>(ctx: IExecuteFunctions, name: string, itemIndex: number): T =>
	ctx.getNodeParameter(name, itemIndex) as T;

const optional = (value: string): string | undefined => {
	const trimmed = value.trim();
	return trimmed || undefined;
};

const csv = <T extends string>(values: T[]): T | undefined => {
	const joined = values.filter(Boolean).join(',') as T;
	return joined || undefined;
};

const lines = (value: string): string[] =>
	value
		.split('\n')
		.map((id) => id.trim())
		.filter(Boolean);

const option = (name: string, value: string) => ({ name, value });

const numberPercentField = (
	displayName: string,
	name: string,
	defaultValue: number,
	operations: Operation[],
): INodeProperties => ({
	displayName,
	name,
	type: 'number',
	typeOptions: percentOptions,
	default: defaultValue,
	displayOptions: showFor(...operations),
});

const stringField = (
	displayName: string,
	name: string,
	operations: Operation[],
	extra: Partial<INodeProperties> = {},
): INodeProperties => ({
	displayName,
	name,
	type: 'string',
	default: '',
	displayOptions: showFor(...operations),
	...extra,
});

const textAreaField = (
	displayName: string,
	name: string,
	rows: number,
	operations: Operation[],
	extra: Partial<INodeProperties> = {},
): INodeProperties =>
	stringField(displayName, name, operations, {
		typeOptions: { rows },
		...extra,
	});

const operationField: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	options: OPERATIONS.map(([name, value, description, action]) => ({
		name,
		value,
		description,
		action,
	})),
	default: 'popBlitz',
};

const commonFields: INodeProperties[] = [
	stringField('Content ID', 'contentId', [
		'getContentById',
		'getPostById',
		'deleteContent',
		'scheduleContent',
	], {
		required: true,
	}),

	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 50,
		description: 'Max number of results to return',
		displayOptions: showFor('getContent', 'getPosts'),
	},

	{
		displayName: 'Status',
		name: 'status',
		type: 'multiOptions',
		default: [],
		options: ['BUILDING', 'CREATED', 'FAILED', 'POSTED', 'SCHEDULED'].map((status) =>
			option(status, status),
		),
		displayOptions: showFor('getContent', 'getPosts'),
	},
];

const contentFields: INodeProperties[] = [
	{
		displayName: 'Content Type',
		name: 'contentType',
		type: 'options',
		default: 'slideshow',
		options: [
			option('Green Screen', 'green-screen'),
			option('Slideshow', 'slideshow'),
			option('Video Hook', 'video-hook'),
			option('Wall of Text', 'wall-of-text'),
		],
		displayOptions: showFor('getContent'),
	},
];

const preferenceFields: INodeProperties[] = [
	numberPercentField('Slideshow Weight', 'slideshowWeight', 25, ['updatePreferences']),
	numberPercentField('Wall of Text Weight', 'wallOfTextWeight', 25, ['updatePreferences']),
	numberPercentField('Green Screen Weight', 'greenScreenWeight', 25, ['updatePreferences']),
	numberPercentField('Video Hook Weight', 'videoHookWeight', 25, ['updatePreferences']),
	numberPercentField('Remix Percentage', 'remixPercentage', 50, ['updatePreferences']),
	numberPercentField('Own Media Percentage', 'ownMediaPercentage', 50, ['updatePreferences']),
	numberPercentField('Mention Business Percentage', 'mentionBusinessPercentage', 50, [
		'updatePreferences',
	]),
];

const angleFields: INodeProperties[] = [
	stringField('Angle ID', 'angleId', ['updateAngle', 'deleteAngle']),
	stringField('Title', 'title', ['createAngle', 'updateAngle']),
	textAreaField('Description', 'description', 3, ['createAngle', 'updateAngle']),
	stringField('Target Audience', 'targetAudience', ['createAngle', 'updateAngle']),
	{
		displayName: 'Active',
		name: 'isActive',
		type: 'boolean',
		default: true,
		displayOptions: showFor('updateAngle'),
	},
];

const scheduleFields: INodeProperties[] = [
	{
		displayName: 'Platform',
		name: 'platform',
		type: 'options',
		options: [
			option('Instagram', 'instagram'),
			option('Reddit', 'reddit'),
			option('TikTok', 'tiktok'),
			option('YouTube', 'youtube'),
		],
		default: 'tiktok',
		displayOptions: showFor('scheduleContent'),
	},
	{
		displayName: 'Schedule Date & Time',
		name: 'utc_datetime',
		type: 'dateTime',
		default: '',
		displayOptions: showFor('scheduleContent'),
	},
	textAreaField('Caption', 'caption', 2, ['scheduleContent']),
	textAreaField('Description', 'description', 3, ['scheduleContent']),
	stringField('Connection ID', 'connectionId', ['scheduleContent'], {
		placeholder: 'Leave empty for auto-select',
	}),
];

const postFields: INodeProperties[] = [
	textAreaField('Post IDs', 'postIds', 4, ['cancelPosts'], {
		placeholder: 'Enter post IDs, one per line',
	}),
	textAreaField('Post IDs', 'analyticsPostIds', 4, ['getPostAnalytics'], {
		placeholder: 'Enter post IDs, one per line',
	}),
];

const properties: INodeProperties[] = [
	operationField,
	...commonFields,
	...contentFields,
	...preferenceFields,
	...angleFields,
	...scheduleFields,
	...postFields,
];

const handlers: Record<Operation, Handler> = {
	popBlitz: async (_ctx, client) => client.popBlitz(),

	getContent: async (ctx, client, itemIndex) => {
		const status = p<ContentStatus[]>(ctx, 'status', itemIndex).filter(Boolean);
		return client.getContent({
			limit: p<number>(ctx, 'limit', itemIndex),
			status: status.length > 0 ? csv(status) : undefined,
			type: p<ContentType>(ctx, 'contentType', itemIndex),
		});
	},

	getContentById: async (ctx, client, itemIndex) =>
		client.getContentById(p<string>(ctx, 'contentId', itemIndex)),

	deleteContent: async (ctx, client, itemIndex) =>
		client.deleteContent(p<string>(ctx, 'contentId', itemIndex)),

	getPreferences: async (_ctx, client) => client.getPreferences(),

	updatePreferences: async (ctx, client, itemIndex) =>
		client.updatePreferences({
			slideshowWeight: p<number>(ctx, 'slideshowWeight', itemIndex),
			wallOfTextWeight: p<number>(ctx, 'wallOfTextWeight', itemIndex),
			greenScreenWeight: p<number>(ctx, 'greenScreenWeight', itemIndex),
			videoHookWeight: p<number>(ctx, 'videoHookWeight', itemIndex),
			remixPercentage: p<number>(ctx, 'remixPercentage', itemIndex),
			ownMediaPercentage: p<number>(ctx, 'ownMediaPercentage', itemIndex),
			mentionBusinessPercentage: p<number>(ctx, 'mentionBusinessPercentage', itemIndex),
		}),

	getAngles: async (_ctx, client) => client.getAngles(),

	createAngle: async (ctx, client, itemIndex) =>
		client.createAngle({
			title: p<string>(ctx, 'title', itemIndex),
			description: p<string>(ctx, 'description', itemIndex),
			targetAudience: p<string>(ctx, 'targetAudience', itemIndex),
		}),

	updateAngle: async (ctx, client, itemIndex) =>
		client.updateAngle(p<string>(ctx, 'angleId', itemIndex), {
			title: p<string>(ctx, 'title', itemIndex),
			description: p<string>(ctx, 'description', itemIndex),
			targetAudience: p<string>(ctx, 'targetAudience', itemIndex),
			isActive: p<boolean>(ctx, 'isActive', itemIndex),
		}),

	deleteAngle: async (ctx, client, itemIndex) =>
		client.deleteAngle(p<string>(ctx, 'angleId', itemIndex)),

	getConnections: async (_ctx, client) => client.getConnections(),

	scheduleContent: async (ctx, client, itemIndex) =>
		client.scheduleContent(p<string>(ctx, 'contentId', itemIndex), {
			platform: p<Platform>(ctx, 'platform', itemIndex),
			utc_datetime: p<string>(ctx, 'utc_datetime', itemIndex),
			caption: p<string>(ctx, 'caption', itemIndex),
			description: p<string>(ctx, 'description', itemIndex),
			connectionId: optional(p<string>(ctx, 'connectionId', itemIndex)),
		}),

	getPosts: async (ctx, client, itemIndex) =>
		client.getPosts({
			limit: p<number>(ctx, 'limit', itemIndex),
			status: csv(p<PostStatus[]>(ctx, 'status', itemIndex)),
		}),

	getPostById: async (ctx, client, itemIndex) =>
		client.getPostById(p<string>(ctx, 'contentId', itemIndex)),

	cancelPosts: async (ctx, client, itemIndex) =>
		client.cancelPosts(lines(p<string>(ctx, 'postIds', itemIndex))),

	getPostAnalytics: async (ctx, client, itemIndex) =>
		client.getPostAnalytics(lines(p<string>(ctx, 'analyticsPostIds', itemIndex))),
};

export class FastlaneAI implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Fastlane AI',
		name: 'fastlaneAi',
		icon: {
			light: 'file:../../icons/fastlane.svg',
			dark: 'file:../../icons/fastlane.dark.svg',
		},
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Generate AI content with Fastlane',
		defaults: {
			name: 'Fastlane AI',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'fastlaneApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api.usefastlane.ai/api/v1',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const credentials = await this.getCredentials('fastlaneApi');
		const client = new FastlaneClient(credentials.apiKey as string);

		const output: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const operation = p<Operation>(this, 'operation', itemIndex);
				const handler = handlers[operation];

				if (!handler) {
					throw new NodeOperationError(this.getNode(), `Operation "${operation}" is not supported`, {
						itemIndex,
					});
				}

				const result = await handler(this, client, itemIndex);

				output.push({
					json: result as IDataObject,
					pairedItem: { item: itemIndex },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					output.push({
						json: {
							error: error instanceof Error ? error.message : String(error),
						},
						pairedItem: { item: itemIndex },
					});
					continue;
				}

				if (error instanceof NodeOperationError) {
					throw error;
				}

				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex });
			}
		}

		return [output];
	}
}