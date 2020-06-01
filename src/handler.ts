import { DB } from './module/db';
import { DynamoDB } from 'aws-sdk';
import { Handler } from 'aws-lambda';
import { WebsocketAPIGatewayEvent } from './types';

const connectionDBTable: string = 'ConnectionsTable';

export const onConnect: Handler = async (event: WebsocketAPIGatewayEvent): Promise<object> => {
  const putParams: DynamoDB.DocumentClient.PutItemInput = {
    TableName: connectionDBTable,
    Item: {
      connectionId: event.requestContext.connectionId
    }
  };

  console.log('putParams', putParams);
  console.log('writing to the db table...');
  return await DB.put(putParams).promise();
};

export const onDisconnect: Handler = async (event: WebsocketAPIGatewayEvent): Promise<object> => {
  const deleteParams: DynamoDB.DocumentClient.DeleteItemInput = {
    TableName: connectionDBTable,
    Key: {
      connectionId: event.requestContext.connectionId
    }
  };

  console.log('deleteParams', deleteParams);

  return await DB.delete(deleteParams).promise();
};

// TODO: add return type
export const defaultMessage: Handler = async (event: WebsocketAPIGatewayEvent) => {
  return {
    status: 403,
    event: event
  };
};
