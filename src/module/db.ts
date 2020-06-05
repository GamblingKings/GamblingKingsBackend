import { DynamoDB, AWSError } from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { PromiseResult } from 'aws-sdk/lib/request';
import { v4 as uuid } from 'uuid';
import { CONNECTIONS_TABLE, GAMES_TABLE } from '../constants';

/**
 * Custom DynamoDB Response type.
 */
type DynamoDBResponse<T> = PromiseResult<T, AWSError>;

/**
 * Create a DynamoDB DocumentClient instance
 */
export const DB = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  // ////////////////////////////////////
  // Uncomment for local dev only
  // ////////////////////////////////////
  // region: 'localhost',
  // endpoint: 'http://localhost:8000',
});

/**
 * Save new connection with connectionId to the ConnectionsTable.
 * @param {string} connectionId connectionId from event.requestContext
 */
export const saveConnection = async (connectionId: string): Promise<DynamoDBResponse<DocumentClient.PutItemOutput>> => {
  const putParams: DocumentClient.PutItemInput = {
    TableName: CONNECTIONS_TABLE,
    Item: {
      connectionId,
    },
  };

  return DB.put(putParams).promise();
};

/**
 * Remove connection by connectionId from the ConnectionsTable.
 * @param {string} connectionId connectionId from event.requestContext
 */
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

/**
 * Set username for a connection.
 * @param {string} connectionId connectionId
 * @param {string} username username
 */
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

/**
 * Get all connections (rows) from the ConnectionsTable.
 * Note: only connectionId attribute is retrieved to save DB read cost.
 */
export const getAllConnections = async (): Promise<PromiseResult<DocumentClient.ScanOutput, AWSError>> => {
  const scanParams: DocumentClient.ScanInput = {
    TableName: CONNECTIONS_TABLE,
    AttributesToGet: ['connectionId'], // only get connection Ids from each row
  };

  return DB.scan(scanParams).promise();
};

/**
 * Create a game that takes in a list of connection Ids (users) and write to the GamesTable.
 * @param {string[]} connections an array of connectionIds
 */
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

/**
 * Get all the games (rows) from the GamesTable.
 * @param {string[]} attributes an array of attributes of a game. Default to be gameId
 */
export const getAllGames = async (
  attributes: string[] = ['gameId'],
): Promise<PromiseResult<DocumentClient.ScanOutput, AWSError>> => {
  const scanParams: DocumentClient.ScanInput = {
    TableName: GAMES_TABLE,
    AttributesToGet: attributes,
  };

  return DB.scan(scanParams).promise();
};
