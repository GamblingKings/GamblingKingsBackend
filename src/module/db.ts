import { DynamoDB, AWSError } from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { PromiseResult } from 'aws-sdk/lib/request';
import { v4 as uuid } from 'uuid';
import { CONNECTIONS_TABLE, GAMES_TABLE } from '../constants';

type DynamoDBResponse<T> = PromiseResult<T, AWSError>;

export const DB = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  // ////////////////////////////////////
  // Uncomment for local dev only
  // ////////////////////////////////////
  region: 'localhost',
  endpoint: 'http://localhost:8000',
});

export const saveConnection = async (connectionId: string): Promise<DynamoDBResponse<DocumentClient.PutItemOutput>> => {
  const putParams: DocumentClient.PutItemInput = {
    TableName: CONNECTIONS_TABLE,
    Item: {
      connectionId,
    },
  };

  return DB.put(putParams).promise();
};

export const deleteConnection = async (
  connectionId: string,
): Promise<PromiseResult<DocumentClient.DeleteItemOutput, AWSError>> => {
  const deleteParams: DocumentClient.DeleteItemInput = {
    TableName: CONNECTIONS_TABLE,
    Key: {
      connectionId,
    },
  };

  return DB.delete(deleteParams).promise();
};

export const setUserName = async (
  connectionId: string,
  username: string,
): Promise<DynamoDBResponse<DocumentClient.UpdateItemOutput>> => {
  const updateParams: DocumentClient.UpdateItemInput = {
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

  return DB.update(updateParams).promise();
};

export const getAllConnections = async (): Promise<PromiseResult<DocumentClient.ScanOutput, AWSError>> => {
  const scanParams: DocumentClient.ScanInput = {
    TableName: CONNECTIONS_TABLE,
    AttributesToGet: ['connectionId'], // only get connection Ids from each row
  };

  return DB.scan(scanParams).promise();
};

export const createGame = async (
  connections: string[],
): Promise<PromiseResult<DocumentClient.PutItemOutput, AWSError>> => {
  const putParam: DocumentClient.PutItemInput = {
    TableName: GAMES_TABLE,
    Item: {
      gameId: uuid(),
      connections,
    },
  };

  console.log('putParma:', putParam);
  return DB.put(putParam).promise();
};

export const getAllGames = async (
  attributes: string[] = ['gameId'],
): Promise<PromiseResult<DocumentClient.ScanOutput, AWSError>> => {
  const scanParams: DocumentClient.ScanInput = {
    TableName: GAMES_TABLE,
    AttributesToGet: attributes,
  };

  return DB.scan(scanParams).promise();
};
