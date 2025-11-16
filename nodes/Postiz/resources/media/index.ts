import { IExecuteFunctions, NodeOperationError, INodeProperties } from 'n8n-workflow';
import { postizApiRequest } from '../../GenericFunctions';

export const operation: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			category: ['media'],
		},
	},
	options: [
		{
			name: 'Upload a File',
			value: 'uploadFile',
			description: 'Upload a file to Postiz',
			action: 'Upload a file to postiz',
		},
		{
			name: 'Generate Video',
			value: 'generateVideo',
			description: 'Generate videos with AI',
			action: 'Generate videos with AI',
		},
	],
	default: 'uploadFile',
};

// UploadFile parameters
export const uploadFileBinaryProperty: INodeProperties = {
	displayName: 'Binary Property',
	name: 'binaryProperty',
	type: 'string',
	displayOptions: {
		show: {
			category: ['media'],
			operation: ['uploadFile'],
		},
	},
	default: '',
	required: true,
	description: 'Name of the binary property that contains the file data',
};

// GenerateVideo parameters
export const generateVideoType: INodeProperties = {
	displayName: 'Video Type',
	name: 'videoType',
	type: 'string',
	displayOptions: {
		show: {
			category: ['media'],
			operation: ['generateVideo'],
		},
	},
	default: 'image-text-slides',
	required: true,
	description: 'Type of video to generate (e.g., image-text-slides, veo3)',
};

export const generateVideoOutput: INodeProperties = {
	displayName: 'Output Format',
	name: 'output',
	type: 'options',
	displayOptions: {
		show: {
			category: ['media'],
			operation: ['generateVideo'],
		},
	},
	options: [
		{
			name: 'Vertical',
			value: 'vertical',
		},
		{
			name: 'Horizontal',
			value: 'horizontal',
		},
	],
	default: 'vertical',
	required: true,
	description: 'Video output format',
};

export const generateVideoCustomParameters: INodeProperties = {
	displayName: 'Custom Parameters',
	name: 'customParameters',
	placeholder: 'Add Custom Parameter',
	type: 'fixedCollection',
	typeOptions: {
		multipleValues: true,
	},
	displayOptions: {
		show: {
			category: ['media'],
			operation: ['generateVideo'],
		},
	},
	default: {},
	options: [
		{
			name: 'parameter',
			displayName: 'Parameter',
			values: [
				{
					displayName: 'Key',
					name: 'key',
					type: 'string',
					default: '',
					required: true,
					description: 'Parameter key (e.g., voice, images)',
				},
				{
					displayName: 'Value',
					name: 'value',
					type: 'string',
					default: '',
					required: true,
					description: 'Parameter value',
				},
			],
		},
	],
	description:
		'Custom parameters for video generation (e.g., prompt: "description", voice: voice-ID, images: [{"ID":"...","path":"..."}])',
};

export const properties: INodeProperties[] = [
	operation,
	uploadFileBinaryProperty,
	generateVideoType,
	generateVideoOutput,
	generateVideoCustomParameters,
];

export async function uploadFile(context: IExecuteFunctions, itemIndex: number): Promise<any> {
	const binaryPropertyName = context.getNodeParameter('binaryProperty', itemIndex) as any;
	const binaryData = context.helpers.assertBinaryData(itemIndex, binaryPropertyName);
	const dataBuffer = await context.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);
	const mimeType = binaryData.mimeType || 'application/octet-stream';

	if (!dataBuffer || !binaryData) {
		throw new NodeOperationError(
			context.getNode(),
			`Item is not of type "binary" or does not contain the expected properties: data, mimeType, fileName`,
			{ itemIndex },
		);
	}

	const blob = new Blob([dataBuffer], {
		type: mimeType,
	});

	const formData = new FormData();
	formData.append('file', blob, binaryData.fileName);
	return await postizApiRequest.call(context, 'POST', '/upload', formData);
}

export async function generateVideo(context: IExecuteFunctions, itemIndex: number): Promise<any> {
	const videoType = context.getNodeParameter('videoType', itemIndex) as string;
	const output = context.getNodeParameter('output', itemIndex) as string;
	const customParametersParam = context.getNodeParameter('customParameters', itemIndex, {}) as any;

	const body: any = {
		type: videoType,
		output,
		customParams: {},
	};

	// Add custom parameters dynamically
	if (customParametersParam.parameter && customParametersParam.parameter.length > 0) {
		customParametersParam.parameter.forEach((param: any) => {
			// Try to parse JSON values, otherwise use as string
			try {
				body.customParams[param.key] = JSON.parse(param.value);
			} catch {
				body.customParams[param.key] = param.value;
			}
		});
	}

	return await postizApiRequest.call(context, 'POST', '/generate-video', body);
}

export async function execute(
	operation: string,
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<any> {
	switch (operation) {
		case 'uploadFile':
			return await uploadFile(context, itemIndex);
		case 'generateVideo':
			return await generateVideo(context, itemIndex);
		default:
			throw new NodeOperationError(context.getNode(), `Unknown operation: ${operation}`);
	}
}
