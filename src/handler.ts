/* eslint-disable import/no-extraneous-dependencies */
import { DynamoDB } from 'aws-sdk';
// eslint-disable-next-line import/no-unresolved
import { Handler } from 'aws-lambda';
import DB from './module/db';
import { WebsocketAPIGatewayEvent } from './types';

const connectionDBTable = <string>process.env.ConnectionsTable;

// eslint-disable-next-line consistent-return
export const onConnect: Handler = async (event: WebsocketAPIGatewayEvent) => {
  const putParams: DynamoDB.DocumentClient.PutItemInput = {
    TableName: connectionDBTable,
    Item: {
      connectionId: event.requestContext.connectionId,
    },
  };

  console.log('putParams', putParams);
  console.log('Writing connectionId to the db table...');

  try {
    return DB.put(putParams).promise();
  } catch (err) {
    console.error(err);
  }
};

// eslint-disable-next-line consistent-return
export const onDisconnect: Handler = async (event: WebsocketAPIGatewayEvent) => {
  const deleteParams: DynamoDB.DocumentClient.DeleteItemInput = {
    TableName: connectionDBTable,
    Key: {
      connectionId: event.requestContext.connectionId,
    },
  };

  console.log('deleteParams', deleteParams);
  console.log('Deleting connectionId from the db table...');

  try {
    return DB.delete(deleteParams).promise();
  } catch (err) {
    console.error(err);
  }
};

// TODO: add return type
export const defaultMessage: Handler = async (event: WebsocketAPIGatewayEvent) => {
  return {
    status: 403,
    event,
  };
};
