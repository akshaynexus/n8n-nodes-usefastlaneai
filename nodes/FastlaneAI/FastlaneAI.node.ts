import {
	NodeConnectionTypes,
	NodeOperationError,
	type IExecuteFunctions,
	type IDataObject,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';
import { FastlaneClient } from 'usefastlane-api';

export class FastlaneAI implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Fastlane AI',
		name: 'fastlaneAi',
		icon: { light: 'file:../../icons/fastlane.svg', dark: 'file:../../icons/fastlane.dark.svg' },
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
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Cancel Posts',
						value: 'cancelPosts',
						description: 'Cancel scheduled posts',
						action: 'Cancel posts',
					},
					{
						name: 'Create Angle',
						value: 'createAngle',
						description: 'Create a new content angle',
						action: 'Create angle',
					},
					{
						name: 'Delete Angle',
						value: 'deleteAngle',
						description: 'Delete a content angle',
						action: 'Delete angle',
					},
					{
						name: 'Delete Content',
						value: 'deleteContent',
						description: 'Delete a content item',
						action: 'Delete content',
					},
					{
						name: 'Get Angles',
						value: 'getAngles',
						description: 'Get all content angles',
						action: 'Get angles',
					},
					{
						name: 'Get Connections',
						value: 'getConnections',
						description: 'Get connected social accounts',
						action: 'Get connections',
					},
					{
						name: 'Get Content',
						value: 'getContent',
						description: 'Get content items from the library',
						action: 'Get content items',
					},
					{
						name: 'Get Content by ID',
						value: 'getContentById',
						description: 'Get a specific content item',
						action: 'Get content by ID',
					},
					{
						name: 'Get Post Analytics',
						value: 'getPostAnalytics',
						description: 'Get engagement metrics for posts',
						action: 'Get post analytics',
					},
					{
						name: 'Get Post by ID',
						value: 'getPostById',
						description: 'Get a specific post',
						action: 'Get post by ID',
					},
					{
						name: 'Get Posts',
						value: 'getPosts',
						description: 'Get scheduled and posted posts',
						action: 'Get posts',
					},
					{
						name: 'Get Preferences',
						value: 'getPreferences',
						description: 'Get discovery queue preferences',
						action: 'Get preferences',
					},
					{
						name: 'Pop Blitz',
						value: 'popBlitz',
						description: 'Generate new content from the discovery queue',
						action: 'Pop a blitz from the discovery queue',
					},
					{
						name: 'Schedule Content',
						value: 'scheduleContent',
						description: 'Schedule content for posting',
						action: 'Schedule content',
					},
					{
						name: 'Update Angle',
						value: 'updateAngle',
						description: 'Update an existing content angle',
						action: 'Update angle',
					},
					{
						name: 'Update Preferences',
						value: 'updatePreferences',
						description: 'Update discovery queue preferences',
						action: 'Update preferences',
					},
				],
				default: 'popBlitz',
			},
			// Content Parameters
			{
				displayName: 'Content ID',
				name: 'contentId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['getContentById', 'deleteContent', 'scheduleContent'],
					},
				},
			},
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
				displayOptions: {
					show: {
						operation: ['getContent', 'getPosts'],
					},
				},
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'multiOptions',
				default: [],
				options: [
					{ name: 'BUILDING', value: 'BUILDING' },
					{ name: 'CREATED', value: 'CREATED' },
					{ name: 'FAILED', value: 'FAILED' },
					{ name: 'POSTED', value: 'POSTED' },
					{ name: 'SCHEDULED', value: 'SCHEDULED' },
				],
				displayOptions: {
					show: {
						operation: ['getContent', 'getPosts'],
					},
				},
			},
			{
				displayName: 'Content Type',
				name: 'contentType',
				type: 'options',
				default: 'slideshow',
				options: [
					{ name: 'Green Screen', value: 'green-screen' },
					{ name: 'Slideshow', value: 'slideshow' },
					{ name: 'Video Hook', value: 'video-hook' },
					{ name: 'Wall of Text', value: 'wall-of-text' },
				],
				displayOptions: {
					show: {
						operation: ['getContent'],
					},
				},
			},
			// Preferences Parameters
			{
				displayName: 'Slideshow Weight',
				name: 'slideshowWeight',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 100,
				},
				default: 25,
				displayOptions: {
					show: {
						operation: ['updatePreferences'],
					},
				},
			},
			{
				displayName: 'Wall of Text Weight',
				name: 'wallOfTextWeight',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 100,
				},
				default: 25,
				displayOptions: {
					show: {
						operation: ['updatePreferences'],
					},
				},
			},
			{
				displayName: 'Green Screen Weight',
				name: 'greenScreenWeight',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 100,
				},
				default: 25,
				displayOptions: {
					show: {
						operation: ['updatePreferences'],
					},
				},
			},
			{
				displayName: 'Video Hook Weight',
				name: 'videoHookWeight',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 100,
				},
				default: 25,
				displayOptions: {
					show: {
						operation: ['updatePreferences'],
					},
				},
			},
			{
				displayName: 'Remix Percentage',
				name: 'remixPercentage',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 100,
				},
				default: 50,
				displayOptions: {
					show: {
						operation: ['updatePreferences'],
					},
				},
			},
			{
				displayName: 'Own Media Percentage',
				name: 'ownMediaPercentage',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 100,
				},
				default: 50,
				displayOptions: {
					show: {
						operation: ['updatePreferences'],
					},
				},
			},
			{
				displayName: 'Mention Business Percentage',
				name: 'mentionBusinessPercentage',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 100,
				},
				default: 50,
				displayOptions: {
					show: {
						operation: ['updatePreferences'],
					},
				},
			},
			// Angle Parameters
			{
				displayName: 'Angle ID',
				name: 'angleId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['updateAngle', 'deleteAngle'],
					},
				},
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['createAngle', 'updateAngle'],
					},
				},
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '',
				displayOptions: {
					show: {
						operation: ['createAngle', 'updateAngle'],
					},
				},
			},
			{
				displayName: 'Target Audience',
				name: 'targetAudience',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['createAngle', 'updateAngle'],
					},
				},
			},
			{
				displayName: 'Active',
				name: 'isActive',
				type: 'boolean',
				default: true,
				displayOptions: {
					show: {
						operation: ['updateAngle'],
					},
				},
			},
			// Schedule Parameters
			{
				displayName: 'Platform',
				name: 'platform',
				type: 'options',
				options: [
					{ name: 'Instagram', value: 'instagram' },
					{ name: 'Reddit', value: 'reddit' },
					{ name: 'TikTok', value: 'tiktok' },
					{ name: 'YouTube', value: 'youtube' },
				],
				default: 'tiktok',
				displayOptions: {
					show: {
						operation: ['scheduleContent'],
					},
				},
			},
			{
				displayName: 'Schedule Date & Time',
				name: 'utc_datetime',
				type: 'dateTime',
				default: '',
				displayOptions: {
					show: {
						operation: ['scheduleContent'],
					},
				},
			},
			{
				displayName: 'Caption',
				name: 'caption',
				type: 'string',
				typeOptions: {
					rows: 2,
				},
				default: '',
				displayOptions: {
					show: {
						operation: ['scheduleContent'],
					},
				},
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '',
				displayOptions: {
					show: {
						operation: ['scheduleContent'],
					},
				},
			},
			{
				displayName: 'Connection ID',
				name: 'connectionId',
				type: 'string',
				default: '',
				placeholder: 'Leave empty for auto-select',
				displayOptions: {
					show: {
						operation: ['scheduleContent'],
					},
				},
			},
			// Cancel Posts Parameters
			{
				displayName: 'Post IDs',
				name: 'postIds',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				placeholder: 'Enter post IDs, one per line',
				displayOptions: {
					show: {
						operation: ['cancelPosts'],
					},
				},
			},
			// Analytics Parameters
			{
				displayName: 'Post IDs',
				name: 'analyticsPostIds',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				placeholder: 'Enter post IDs, one per line',
				displayOptions: {
					show: {
						operation: ['getPostAnalytics'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const credentials = await this.getCredentials('fastlaneApi');
		const client = new FastlaneClient(credentials.apiKey as string);

		const output: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const operation = this.getNodeParameter('operation', itemIndex) as string;
				let result: unknown;

				switch (operation) {
					case 'popBlitz': {
						result = await client.popBlitz();
						break;
					}

					case 'getContent': {
						const contentLimit = this.getNodeParameter('limit', itemIndex) as number;
						const contentStatus = this.getNodeParameter('status', itemIndex) as string[];
						const contentType = this.getNodeParameter('contentType', itemIndex) as string;
						const joinedStatus = contentStatus.join(',');
						result = await client.getContent({
							limit: contentLimit,
							status: joinedStatus ? (joinedStatus as 'BUILDING' | 'CREATED' | 'FAILED') : undefined,
							type: contentType as 'slideshow' | 'wall-of-text' | 'green-screen' | 'video-hook' | undefined,
						});
						break;
					}

					case 'getContentById': {
						const contentId = this.getNodeParameter('contentId', itemIndex) as string;
						result = await client.getContentById(contentId);
						break;
					}

					case 'deleteContent': {
						const contentId = this.getNodeParameter('contentId', itemIndex) as string;
						result = await client.deleteContent(contentId);
						break;
					}

					case 'getPreferences': {
						result = await client.getPreferences();
						break;
					}

					case 'updatePreferences': {
						const prefs = {
							slideshowWeight: this.getNodeParameter('slideshowWeight', itemIndex) as number,
							wallOfTextWeight: this.getNodeParameter('wallOfTextWeight', itemIndex) as number,
							greenScreenWeight: this.getNodeParameter('greenScreenWeight', itemIndex) as number,
							videoHookWeight: this.getNodeParameter('videoHookWeight', itemIndex) as number,
							remixPercentage: this.getNodeParameter('remixPercentage', itemIndex) as number,
							ownMediaPercentage: this.getNodeParameter('ownMediaPercentage', itemIndex) as number,
							mentionBusinessPercentage: this.getNodeParameter('mentionBusinessPercentage', itemIndex) as number,
						};
						result = await client.updatePreferences(prefs);
						break;
					}

					case 'getAngles': {
						result = await client.getAngles();
						break;
					}

					case 'createAngle': {
						const newAngle = {
							title: this.getNodeParameter('title', itemIndex) as string,
							description: this.getNodeParameter('description', itemIndex) as string,
							targetAudience: this.getNodeParameter('targetAudience', itemIndex) as string,
						};
						result = await client.createAngle(newAngle);
						break;
					}

					case 'updateAngle': {
						const angleId = this.getNodeParameter('angleId', itemIndex) as string;
						const angleData = {
							title: this.getNodeParameter('title', itemIndex) as string | undefined,
							description: this.getNodeParameter('description', itemIndex) as string | undefined,
							targetAudience: this.getNodeParameter('targetAudience', itemIndex) as string | undefined,
							isActive: this.getNodeParameter('isActive', itemIndex) as boolean | undefined,
						};
						result = await client.updateAngle(angleId, angleData);
						break;
					}

					case 'deleteAngle': {
						const angleId = this.getNodeParameter('angleId', itemIndex) as string;
						result = await client.deleteAngle(angleId);
						break;
					}

					case 'getConnections': {
						result = await client.getConnections();
						break;
					}

					case 'scheduleContent': {
						const contentId = this.getNodeParameter('contentId', itemIndex) as string;
						const platform = this.getNodeParameter('platform', itemIndex) as string;
						const scheduleData = {
							platform: platform as 'tiktok' | 'instagram' | 'youtube' | 'reddit',
							utc_datetime: this.getNodeParameter('utc_datetime', itemIndex) as string,
							caption: this.getNodeParameter('caption', itemIndex) as string,
							description: this.getNodeParameter('description', itemIndex) as string,
							connectionId: (this.getNodeParameter('connectionId', itemIndex) as string) || undefined,
						};
						result = await client.scheduleContent(contentId, scheduleData);
						break;
					}

					case 'getPosts': {
						const limit = this.getNodeParameter('limit', itemIndex) as number;
						const status = this.getNodeParameter('status', itemIndex) as string[];
						result = await client.getPosts({
							limit,
							status: status.join(',') as 'BUILDING' | 'CREATED' | 'FAILED' | 'POSTED' | 'SCHEDULED',
						});
						break;
					}

					case 'getPostById': {
						const contentId = this.getNodeParameter('contentId', itemIndex) as string;
						result = await client.getPostById(contentId);
						break;
					}

					case 'cancelPosts': {
						const postIds = (this.getNodeParameter('postIds', itemIndex) as string)
							.split('\n')
							.map((id) => id.trim())
							.filter((id) => id);
						result = await client.cancelPosts(postIds);
						break;
					}

					case 'getPostAnalytics': {
						const postIds = (this.getNodeParameter('analyticsPostIds', itemIndex) as string)
							.split('\n')
							.map((id) => id.trim())
							.filter((id) => id);
						result = await client.getPostAnalytics(postIds);
						break;
					}

					default: {
						throw new NodeOperationError(this.getNode(), `Operation "${operation}" is not supported`);
					}
				}

				output.push({ json: result as IDataObject, pairedItem: { item: itemIndex } });
			} catch (error) {
				if (this.continueOnFail()) {
					output.push({ json: { error: (error as Error).message }, pairedItem: { item: itemIndex } });
				} else {
					if (error instanceof NodeOperationError) {
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error as Error, { itemIndex });
				}
			}
		}

		return [output];
	}
}