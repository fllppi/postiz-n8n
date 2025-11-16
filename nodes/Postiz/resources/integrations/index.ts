import { IExecuteFunctions, INodeProperties, NodeOperationError } from 'n8n-workflow';
import { postizApiRequest } from '../../GenericFunctions';

export const operation: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			category: ['integrations'],
		},
	},
	options: [
		{
			name: 'Get All Connected Channels',
			value: 'getIntegrations',
			description: 'Get a list of connected channels',
			action: 'Get a list of connected channels',
		},
	],
	default: 'getIntegrations',
};

export const properties: INodeProperties[] = [operation];

export async function getIntegrations(context: IExecuteFunctions, itemIndex: number): Promise<any> {
	return await postizApiRequest.call(context, 'GET', '/integrations');
}

export async function execute(
	operation: string,
	context: IExecuteFunctions,
	itemIndex: number
): Promise<any> {
	switch (operation) {
		case 'getIntegrations':
			return await getIntegrations(context, itemIndex);
		default:
			throw new NodeOperationError(context.getNode(), `Unknown operation: ${operation}`);
	}
}
