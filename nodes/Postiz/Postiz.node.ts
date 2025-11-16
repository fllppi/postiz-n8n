import {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeProperties,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';
import * as integrations from './resources/integrations';
import * as posts from './resources/posts';
import * as media from './resources/media';

const category: INodeProperties = {
	displayName: 'Category',
	name: 'category',
	type: 'options',
	noDataExpression: true,
	options: [
		{
			name: 'Channel',
			value: 'integrations',
		},
		{
			name: 'Post',
			value: 'posts',
		},
		{
			name: 'Media',
			value: 'media',
		},
	],
	default: 'posts',
};

// Module objects organizing properties and functions
const integrationsModule = {
	properties: integrations.properties,
	functions: integrations,
};

const postsModule = {
	properties: posts.properties,
	functions: posts,
};

const mediaModule = {
	properties: media.properties,
	functions: media,
};

export class Postiz implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Postiz',
		name: 'postiz',
		// eslint-disable-next-line n8n-nodes-base/node-class-description-icon-not-svg
		icon: 'file:postiz.png',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["category"] + ": " + $parameter["operation"]}}',
		description: 'Consume Postiz API',
		defaults: {
			name: 'Postiz',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'postizApi',
				required: true,
			},
		],
		properties: [
			category,
			...integrationsModule.properties,
			...postsModule.properties,
			...mediaModule.properties,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const length = items.length;
		let responseData: any = undefined;

		for (let i = 0; i < length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i);
				const category = this.getNodeParameter('category', i);

				switch (category) {
					case 'integrations':
						responseData = await integrationsModule.functions.execute(operation, this);
						break;
					case 'posts':
						responseData = await postsModule.functions.execute(operation, this, i);
						break;
					case 'media':
						responseData = await mediaModule.functions.execute(operation, this, i);
						break;
					default:
						throw new NodeOperationError(this.getNode(), `Unknown category: ${category}`);
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData as IDataObject[]),
					{ itemData: { item: i } },
				);

				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					// Continue processing other items, add error info to results
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: error?.description || error?.message || error }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionErrorData);
					continue;
				}
				// If continueOnFail is false, throw the error to stop execution
				throw error;
			}
		}

		return [returnData];
	}
}
