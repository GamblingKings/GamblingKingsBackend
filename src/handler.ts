/* eslint-disable consistent-return */
/* eslint-disable import/no-extraneous-dependencies */
import { DynamoDB, AWSError } from 'aws-sdk';
// eslint-disable-next-line import/no-unresolved
import { Handler } from 'aws-lambda';
import { PromiseResult } from 'aws-sdk/lib/request';
import DB from './module/db';
import { WebsocketAPIGatewayEvent } from './types';
import { CONNECTIONS_TABLE } from './constants';

export const onConnect: Handler = async (event: WebsocketAPIGatewayEvent) => {
  const putParams: DynamoDB.DocumentClient.PutItemInput = {
    TableName: CONNECTIONS_TABLE,
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

export const onDisconnect: Handler = async (event: WebsocketAPIGatewayEvent) => {
  const deleteParams: DynamoDB.DocumentClient.DeleteItemInput = {
    TableName: CONNECTIONS_TABLE,
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

export const onSetUsername: Handler = async (event: WebsocketAPIGatewayEvent) => {
  const { connectionId } = event.requestContext;
  const { username } = JSON.parse(event.body);

  const putParams: DynamoDB.DocumentClient.UpdateItemInput = {
    TableName: CONNECTIONS_TABLE,
    Key: {
      connectionId,
    },
    ExpressionAttributeNames: { '#usernameKey': 'username' },
    UpdateExpression: 'set #usernameKey = :usernameVal',
    ExpressionAttributeValues: {
      ':usernameVal': username,
    },
  };

  try {
    return DB.update(putParams).promise();
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
