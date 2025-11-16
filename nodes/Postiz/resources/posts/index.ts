import { IExecuteFunctions, INodeProperties, NodeOperationError } from 'n8n-workflow';
import { postizApiRequest } from '../../GenericFunctions';

export const operation: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			category: ['posts'],
		},
	},
	options: [
		{
			name: 'Get All Posts',
			value: 'getPosts',
			description: 'Get a list of posts',
			action: 'Get a list of posts',
		},
		{
			name: 'Create a Post',
			value: 'createPost',
			description: 'Schedule a post to Postiz',
			action: 'Schedule a post to postiz',
		},
		{
			name: 'Delete a Post',
			value: 'deletePost',
			description: 'Delete a post by ID',
			action: 'Delete a post by id',
		},
	],
	default: 'getPosts',
};

// CreatePost parameters
export const createPostType: INodeProperties = {
	displayName: 'Type',
	name: 'type',
	type: 'options',
	displayOptions: {
		show: {
			category: ['posts'],
			operation: ['createPost'],
		},
	},
	options: [
		{
			name: 'Draft',
			value: 'draft',
		},
		{
			name: 'Schedule',
			value: 'schedule',
		},
		{
			name: 'Now',
			value: 'now',
		},
	],
	default: 'now',
	required: true,
	description: 'Type of post to create',
};

export const createPostShortLink: INodeProperties = {
	displayName: 'Short Link',
	name: 'shortLink',
	type: 'boolean',
	displayOptions: {
		show: {
			category: ['posts'],
			operation: ['createPost'],
		},
	},
	default: false,
	required: true,
	description: 'Whether to use short links',
};

export const createPostDate: INodeProperties = {
	displayName: 'Date',
	name: 'date',
	type: 'dateTime',
	displayOptions: {
		show: {
			category: ['posts'],
			operation: ['createPost'],
		},
	},
	default: '',
	required: true,
	description: 'Date and time for the post',
};

export const createPostTags: INodeProperties = {
	displayName: 'Tags',
	name: 'tags',
	placeholder: 'Add Tag',
	type: 'fixedCollection',
	typeOptions: {
		multipleValues: true,
	},
	displayOptions: {
		show: {
			category: ['posts'],
			operation: ['createPost'],
		},
	},
	default: {},
	options: [
		{
			name: 'tag',
			displayName: 'Tag',
			values: [
				{
					displayName: 'Value',
					name: 'value',
					type: 'string',
					default: '',
					required: true,
					description: 'Tag value',
				},
				{
					displayName: 'Label',
					name: 'label',
					type: 'string',
					default: '',
					required: true,
					description: 'Tag label',
				},
			],
		},
	],
	description: 'Tags for the post',
};

export const createPostPosts: INodeProperties = {
	displayName: 'Posts',
	name: 'posts',
	placeholder: 'Add Post',
	type: 'fixedCollection',
	typeOptions: {
		multipleValues: true,
	},
	displayOptions: {
		show: {
			category: ['posts'],
			operation: ['createPost'],
		},
	},
	default: {},
	options: [
		{
			name: 'post',
			displayName: 'Post',
			values: [
				{
					displayName: 'Channel ID',
					name: 'integrationId',
					type: 'string',
					default: '',
					required: true,
					description:
						'ID of the channel (you can get from the get channels operation or from the Postiz UI)',
				},
				{
					displayName: 'Group',
					name: 'group',
					type: 'string',
					default: '',
					description: 'Post group',
				},
				{
					displayName: 'Settings',
					name: 'settings',
					placeholder: 'Add Setting',
					type: 'fixedCollection',
					typeOptions: {
						multipleValues: true,
					},
					default: {},
					options: [
						{
							name: 'setting',
							displayName: 'Setting',
							values: [
								{
									displayName: 'Key',
									name: 'key',
									type: 'string',
									default: '',
									required: true,
									description: 'Setting key',
								},
								{
									displayName: 'Value',
									name: 'stringValue',
									type: 'string',
									displayOptions: {
										show: {
											valueType: ['string'],
										},
									},
									default: '',
									required: true,
									description: 'String value',
								},
								{
									displayName: 'Value',
									name: 'numberValue',
									type: 'number',
									displayOptions: {
										show: {
											valueType: ['number'],
										},
									},
									default: 0,
									required: true,
									description: 'Number value',
								},
								{
									displayName: 'Value',
									name: 'booleanValue',
									type: 'boolean',
									displayOptions: {
										show: {
											valueType: ['boolean'],
										},
									},
									default: false,
									required: true,
									description: 'Whether the setting is enabled',
								},
								{
									displayName: 'Value',
									name: 'jsonValue',
									type: 'json',
									displayOptions: {
										show: {
											valueType: ['json'],
										},
									},
									default: '',
									required: true,
									description: 'JSON value (object or array)',
								},
								{
									displayName: 'Value Type',
									name: 'valueType',
									type: 'options',
									options: [
										{
											name: 'String',
											value: 'string',
										},
										{
											name: 'Number',
											value: 'number',
										},
										{
											name: 'Boolean',
											value: 'boolean',
										},
										{
											name: 'JSON',
											value: 'json',
										},
									],
									default: 'string',
									required: true,
									description: 'Type of the setting value',
								},
							],
						},
					],
					description: 'Provider-specific settings',
				},
				{
					displayName: 'Content Items',
					name: 'value',
					placeholder: 'Add Content Item',
					type: 'fixedCollection',
					typeOptions: {
						multipleValues: true,
					},
					default: {},
					options: [
						{
							name: 'contentItem',
							displayName: 'Content Item',
							values: [
								{
									displayName: 'Content',
									name: 'content',
									type: 'string',
									typeOptions: {
										rows: 4,
									},
									default: '',
									required: true,
									description: 'Content text',
								},
								{
									displayName: 'ID',
									name: 'id',
									type: 'string',
									default: '',
									description: 'Content ID (optional)',
								},
								{
									displayName: 'Images',
									name: 'image',
									placeholder: 'Add Image',
									type: 'fixedCollection',
									typeOptions: {
										multipleValues: true,
									},
									default: {},
									options: [
										{
											name: 'imageItem',
											displayName: 'Image',
											values: [
												{
													displayName: 'ID',
													name: 'id',
													type: 'string',
													default: '',
													required: true,
													description: 'Image ID',
												},
												{
													displayName: 'Path',
													name: 'path',
													type: 'string',
													default: '',
													required: true,
													description: 'Image path/URL',
												},
											],
										},
									],
									description: 'Images for this content item',
								},
							],
						},
					],
					description: 'Content items (value array)',
				},
			],
		},
	],
	description: 'Posts array (required for non-draft)',
};

// GetPosts parameters
export const getPostsStartDate: INodeProperties = {
	displayName: 'Start Date (UTC)',
	name: 'startDate',
	type: 'dateTime',
	displayOptions: {
		show: {
			category: ['posts'],
			operation: ['getPosts'],
		},
	},
	default: '',
	required: true,
	description: 'Start date for filtering posts (UTC)',
};

export const getPostsEndDate: INodeProperties = {
	displayName: 'End Date (UTC)',
	name: 'endDate',
	type: 'dateTime',
	displayOptions: {
		show: {
			category: ['posts'],
			operation: ['getPosts'],
		},
	},
	default: '',
	required: true,
	description: 'End date for filtering posts (UTC)',
};

export const getPostsCustomer: INodeProperties = {
	displayName: 'Customer',
	name: 'customer',
	type: 'string',
	displayOptions: {
		show: {
			category: ['posts'],
			operation: ['getPosts'],
		},
	},
	default: '',
	description: 'Customer ID for filtering posts (optional)',
};

// DeletePost parameters
export const deletePostId: INodeProperties = {
	displayName: 'Post ID',
	name: 'postId',
	type: 'string',
	displayOptions: {
		show: {
			category: ['posts'],
			operation: ['deletePost'],
		},
	},
	default: '',
	required: true,
	description: 'ID of the post to delete',
};

export const properties: INodeProperties[] = [
	operation,
	createPostType,
	createPostShortLink,
	createPostDate,
	createPostTags,
	createPostPosts,
	getPostsStartDate,
	getPostsEndDate,
	getPostsCustomer,
	deletePostId,
];

export async function getPosts(context: IExecuteFunctions, itemIndex: number): Promise<any> {
	const startDate = context.getNodeParameter('startDate', itemIndex) as string;
	const endDate = context.getNodeParameter('endDate', itemIndex) as string;
	const customer = context.getNodeParameter('customer', itemIndex) as string;

	const query = {
		startDate,
		endDate,
		...(customer && { customer }),
	};

	return await postizApiRequest.call(context, 'GET', '/posts', {}, query);
}

export async function createPost(context: IExecuteFunctions, itemIndex: number): Promise<any> {
	// Map CreatePostDto fields exactly
	const type = context.getNodeParameter('type', itemIndex) as string;
	const shortLink = context.getNodeParameter('shortLink', itemIndex) as boolean;
	const date = context.getNodeParameter('date', itemIndex) as string;

	// Get array parameters
	const tagsParam = context.getNodeParameter('tags', itemIndex, {}) as any;
	const postsParam = context.getNodeParameter('posts', itemIndex, {}) as any;

	// Process tags array
	const tags = tagsParam.tag
		? tagsParam.tag.map((tag: any) => ({
				value: tag.value,
				label: tag.label,
			}))
		: [];

	// Process posts array
	const posts = postsParam.post
		? postsParam.post.map((post: any) => {
				// Process settings for this post
				const settings: any = {};

				if (post.settings?.setting && post.settings.setting.length > 0) {
					post.settings.setting.forEach((setting: any) => {
						// Determine the actual value based on the selected type
						let value;
						switch (setting.valueType) {
							case 'string':
								value = setting.stringValue;
								break;
							case 'number':
								value = setting.numberValue;
								break;
							case 'boolean':
								value = setting.booleanValue;
								break;
							case 'json':
								try {
									value = JSON.parse(setting.jsonValue);
								} catch {
									value = setting.jsonValue;
								}
								break;
							default:
								value = setting.stringValue; // fallback to string
						}
						settings[setting.key] = value;
					});
				}

				// Process value array (PostContent[])
				const value = post.value?.contentItem
					? post.value.contentItem.map((item: any) => ({
							content: item.content,
							id: item.id || '',
							image: item.image?.imageItem
								? item.image.imageItem.map((img: any) => ({
										id: img.id,
										path: img.path,
									}))
								: [],
						}))
					: [];

				return {
					integration: {
						id: post.integrationId,
					},
					value,
					group: post.group || '',
					settings,
				};
			})
		: [];

	const body = {
		type,
		shortLink,
		date,
		tags,
		posts,
	};

	return await postizApiRequest.call(context, 'POST', '/posts', body);
}

export async function deletePost(context: IExecuteFunctions, itemIndex: number): Promise<any> {
	const postId = context.getNodeParameter('postId', itemIndex) as string;
	return await postizApiRequest.call(context, 'DELETE', `/posts/${postId}`);
}

export async function execute(
	operation: string,
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<any> {
	switch (operation) {
		case 'getPosts':
			return await getPosts(context, itemIndex);
		case 'createPost':
			return await createPost(context, itemIndex);
		case 'deletePost':
			return await deletePost(context, itemIndex);
		default:
			throw new NodeOperationError(context.getNode(), `Unknown operation: ${operation}`);
	}
}
