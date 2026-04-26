import {
	NodeConnectionTypes,
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
		name: 'fastlaneAI',
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
						name: 'Pop Blitz',
						value: 'popBlitz',
						description: 'Generate new content from the discovery queue',
						action: 'Pop a blitz from the discovery queue',
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
						name: 'Delete Content',
						value: 'deleteContent',
						description: 'Delete a content item',
						action: 'Delete content',
					},
					{
						name: 'Get Preferences',
						value: 'getPreferences',
						description: 'Get discovery queue preferences',
						action: 'Get preferences',
					},
					{
						name: 'Update Preferences',
						value: 'updatePreferences',
						description: 'Update discovery queue preferences',
						action: 'Update preferences',
					},
					{
						name: 'Get Angles',
						value: 'getAngles',
						description: 'Get all content angles',
						action: 'Get angles',
					},
					{
						name: 'Create Angle',
						value: 'createAngle',
						description: 'Create a new content angle',
						action: 'Create angle',
					},
					{
						name: 'Update Angle',
						value: 'updateAngle',
						description: 'Update an existing content angle',
						action: 'Update angle',
					},
					{
						name: 'Delete Angle',
						value: 'deleteAngle',
						description: 'Delete a content angle',
						action: 'Delete angle',
					},
					{
						name: 'Get Connections',
						value: 'getConnections',
						description: 'Get connected social accounts',
						action: 'Get connections',
					},
					{
						name: 'Schedule Content',
						value: 'scheduleContent',
						description: 'Schedule content for posting',
						action: 'Schedule content',
					},
					{
						name: 'Get Posts',
						value: 'getPosts',
						description: 'Get scheduled and posted posts',
						action: 'Get posts',
					},
					{
						name: 'Get Post by ID',
						value: 'getPostById',
						description: 'Get a specific post',
						action: 'Get post by ID',
					},
					{
						name: 'Cancel Posts',
						value: 'cancelPosts',
						description: 'Cancel scheduled posts',
						action: 'Cancel posts',
					},
					{
						name: 'Get Post Analytics',
						value: 'getPostAnalytics',
						description: 'Get engagement metrics for posts',
						action: 'Get post analytics',
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
				default: 20,
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
					{ name: 'SCHEDULED', value: 'SCHEDULED' },
					{ name: 'POSTED', value: 'POSTED' },
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
				default: '',
				options: [
					{ name: 'Slideshow', value: 'slideshow' },
					{ name: 'Wall of Text', value: 'wall-of-text' },
					{ name: 'Green Screen', value: 'green-screen' },
					{ name: 'Video Hook', value: 'video-hook' },
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
					{ name: 'TikTok', value: 'tiktok' },
					{ name: 'Instagram', value: 'instagram' },
					{ name: 'YouTube', value: 'youtube' },
					{ name: 'Reddit', value: 'reddit' },
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

	async execute(this: IExecuteFunctions) {
		const credentials = await this.getCredentials('fastlaneApi');
		const operation = this.getNodeParameter('operation', 0) as string;

		const client = new FastlaneClient(credentials.apiKey as string);

		let result: unknown;

		switch (operation) {
			case 'popBlitz':
				result = await client.popBlitz();
				break;

			case 'getContent':
				const contentLimit = this.getNodeParameter('limit', 0) as number;
				const contentStatus = this.getNodeParameter('status', 0) as string[];
				const contentType = this.getNodeParameter('contentType', 0) as string;
				const joinedStatus = contentStatus.join(',');
				result = await client.getContent({
					limit: contentLimit,
					status: joinedStatus ? (joinedStatus as 'BUILDING' | 'CREATED' | 'FAILED') : undefined,
					type: contentType as 'slideshow' | 'wall-of-text' | 'green-screen' | 'video-hook' | undefined,
				});
				break;

			case 'getContentById':
				const contentId = this.getNodeParameter('contentId', 0) as string;
				result = await client.getContentById(contentId);
				break;

			case 'deleteContent':
				const deleteContentId = this.getNodeParameter('contentId', 0) as string;
				result = await client.deleteContent(deleteContentId);
				break;

			case 'getPreferences':
				result = await client.getPreferences();
				break;

			case 'updatePreferences':
				const prefs = {
					slideshowWeight: this.getNodeParameter('slideshowWeight', 0) as number,
					wallOfTextWeight: this.getNodeParameter('wallOfTextWeight', 0) as number,
					greenScreenWeight: this.getNodeParameter('greenScreenWeight', 0) as number,
					videoHookWeight: this.getNodeParameter('videoHookWeight', 0) as number,
					remixPercentage: this.getNodeParameter('remixPercentage', 0) as number,
					ownMediaPercentage: this.getNodeParameter('ownMediaPercentage', 0) as number,
					mentionBusinessPercentage: this.getNodeParameter('mentionBusinessPercentage', 0) as number,
				};
				result = await client.updatePreferences(prefs);
				break;

			case 'getAngles':
				result = await client.getAngles();
				break;

			case 'createAngle':
				const newAngle = {
					title: this.getNodeParameter('title', 0) as string,
					description: this.getNodeParameter('description', 0) as string,
					targetAudience: this.getNodeParameter('targetAudience', 0) as string,
				};
				result = await client.createAngle(newAngle);
				break;

			case 'updateAngle':
				const updateAngleId = this.getNodeParameter('angleId', 0) as string;
				const angleData = {
					title: this.getNodeParameter('title', 0) as string | undefined,
					description: this.getNodeParameter('description', 0) as string | undefined,
					targetAudience: this.getNodeParameter('targetAudience', 0) as string | undefined,
					isActive: this.getNodeParameter('isActive', 0) as boolean | undefined,
				};
				result = await client.updateAngle(updateAngleId, angleData);
				break;

			case 'deleteAngle':
				const deleteAngleId = this.getNodeParameter('angleId', 0) as string;
				result = await client.deleteAngle(deleteAngleId);
				break;

			case 'getConnections':
				result = await client.getConnections();
				break;

			case 'scheduleContent':
				const scheduleContentId = this.getNodeParameter('contentId', 0) as string;
				const scheduleData = {
					platform: this.getNodeParameter('platform', 0) as any,
					utc_datetime: this.getNodeParameter('utc_datetime', 0) as string,
					caption: this.getNodeParameter('caption', 0) as string,
					description: this.getNodeParameter('description', 0) as string,
					connectionId: this.getNodeParameter('connectionId', 0) as string || undefined,
				};
				result = await client.scheduleContent(scheduleContentId, scheduleData);
				break;

			case 'getPosts':
				const postsLimit = this.getNodeParameter('limit', 0) as number;
				const postsStatus = this.getNodeParameter('status', 0) as string[];
				result = await client.getPosts({
					limit: postsLimit,
					status: postsStatus.join(',') as any,
				});
				break;

			case 'getPostById':
				const postId = this.getNodeParameter('contentId', 0) as string;
				result = await client.getPostById(postId);
				break;

			case 'cancelPosts':
				const cancelPostIds = (this.getNodeParameter('postIds', 0) as string)
					.split('\n')
					.map((id) => id.trim())
					.filter((id) => id);
				result = await client.cancelPosts(cancelPostIds);
				break;

			case 'getPostAnalytics':
				const analyticsPostIds = (this.getNodeParameter('analyticsPostIds', 0) as string)
					.split('\n')
					.map((id) => id.trim())
					.filter((id) => id);
				result = await client.getPostAnalytics(analyticsPostIds);
				break;

			default:
				throw new Error(`Operation "${operation}" is not supported`);
		}

		const output: INodeExecutionData[] = [{ json: result as IDataObject }];
		return [output];
	}
}