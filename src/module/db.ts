import { DynamoDB, AWSError } from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { PromiseResult } from 'aws-sdk/lib/request';
import { v4 as uuid } from 'uuid';
import { CONNECTIONS_TABLE, GAMES_TABLE } from '../constants';
import { Game } from '../models/Game';
import { User } from '../models/User';

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
  region: 'localhost',
  endpoint: 'http://localhost:8000',
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
    AttributesToGet: ['connectionId', 'username'], // only get connection Ids from each row
  };

  return DB.scan(scanParams).promise();
};

/**
 * Get user attributes by connection Id
 * @param {string} connectionId connection Id
 */
const getUserByConnectionId = async (
  connectionId: string,
): Promise<PromiseResult<DocumentClient.QueryOutput, AWSError>> => {
  const queryParam: DocumentClient.QueryInput = {
    TableName: CONNECTIONS_TABLE,
    KeyConditionExpression: '#connectionId = :connectionIdVal',
    ExpressionAttributeNames: {
      '#connectionId': 'connectionId',
    },
    ExpressionAttributeValues: {
      ':connectionIdVal': connectionId,
    },
  };

  return DB.query(queryParam).promise();
};

/**
 * Create a game that takes in a list of connection Ids (users) and write to the GamesTable.
 * @param creatorConnectionId creator's connection Id
 * @param {string} gameName game name
 * @param {string} gameType game type
 * @param {string} gameVersion game version
 */
export const createGame = async (
  creatorConnectionId: string,
  gameName?: string,
  gameType?: string,
  gameVersion?: string,
): Promise<PromiseResult<DocumentClient.PutItemOutput, AWSError>> => {
  // Get user by connectionId
  const { Items } = await getUserByConnectionId(creatorConnectionId);
  let user;
  if (Items) {
    user = Items[0] as User;
  }
  console.log('Game creator: ', user);

  // Create game
  if (user) {
    const game: Game = {
      gameId: uuid(),
      users: [user], // put the game creator into the game initially
      gameName: gameName || ' ',
      gameType: gameType || ' ',
      gameVersion: gameVersion || ' ',
    };

    const putParam: DocumentClient.PutItemInput = {
      TableName: GAMES_TABLE,
      Item: game,
    };

    return DB.put(putParam).promise();
  }

  throw new AWSError('User cannot be empty');
};

export const addUserToGame = async (
  gameId: string,
  user: User,
): Promise<PromiseResult<DocumentClient.UpdateItemOutput, AWSError>> => {
  const updateParam: DocumentClient.UpdateItemInput = {
    TableName: GAMES_TABLE,
    Key: {
      gameId,
    },
    // Update users list; if list is empty, append user to an empty list
    UpdateExpression: 'set #users = list_append(if_not_exists(#users, :empty_list), :newUserVal)',
    ExpressionAttributeNames: {
      '#users': 'users',
    },
    ExpressionAttributeValues: {
      ':newUserVal': user,
    },
    ReturnValues: 'ALL_NEW',
  };

  return DB.update(updateParam).promise();
};

/**
 * Get all the games (rows) from the GamesTable.
 */
export const getAllGames = async (): Promise<PromiseResult<DocumentClient.ScanOutput, AWSError>> => {
  const scanParams: DocumentClient.ScanInput = {
    TableName: GAMES_TABLE,
    // AttributesToGet: attributes,
  };

  return DB.scan(scanParams).promise();
};
