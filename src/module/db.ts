import { DynamoDB, AWSError } from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { PromiseResult } from 'aws-sdk/lib/request';
import { v4 as uuid } from 'uuid';
import { CONNECTIONS_TABLE, GAMES_TABLE } from '../constants';
import { Game } from '../models/Game';
import { User } from '../models/User';

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
export const saveConnection = async (connectionId: string): Promise<User> => {
  const putParams: DocumentClient.PutItemInput = {
    TableName: CONNECTIONS_TABLE,
    Item: {
      connectionId,
    },
  };

  const res = await DB.put(putParams).promise();
  return res.Attributes as User;
};

/**
 * Remove connection by connectionId from the ConnectionsTable.
 * @param {string} connectionId connectionId from event.requestContext
 */
export const deleteConnection = async (connectionId: string): Promise<void> => {
  const deleteParams: DocumentClient.DeleteItemInput = {
    TableName: CONNECTIONS_TABLE,
    Key: {
      connectionId,
    },
  };

  await DB.delete(deleteParams).promise();
};

/**
 * Set username for a connection.
 * @param {string} connectionId connectionId
 * @param {string} username username
 */
export const setUserName = async (connectionId: string, username: string): Promise<User> => {
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

  const res = await DB.update(updateParams).promise();
  return res.Attributes as User;
};

/**
 * Get all connections (rows) from the ConnectionsTable.
 * Note: only connectionId attribute is retrieved to save DB read cost.
 */
export const getAllConnections = async (): Promise<User[]> => {
  const scanParams: DocumentClient.ScanInput = {
    TableName: CONNECTIONS_TABLE,
    AttributesToGet: ['connectionId', 'username'], // only get connection Ids from each row
  };

  const res = await DB.scan(scanParams).promise();
  return res.Items as User[];
};

/**
 * Get user attributes by connection Id
 * @param {string} connectionId connection Id
 */
const getUserByConnectionId = async (connectionId: string): Promise<User> => {
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

  const res = await DB.query(queryParam).promise();
  const items = res.Items as DocumentClient.ItemList;
  const user = items[0] as User;
  return user || {};
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
): Promise<Game> => {
  // Get user by connectionId
  const user = await getUserByConnectionId(creatorConnectionId);

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

    DB.put(putParam).promise();
    return game;
  }

  throw new AWSError('User cannot be empty');
};

export const addUserToGame = async (gameId: string, connectionId: string): Promise<Game> => {
  // Get user by connectionId
  const user = await getUserByConnectionId(connectionId);

  const updateParam: DocumentClient.UpdateItemInput = {
    TableName: GAMES_TABLE,
    Key: {
      gameId,
    },
    // Update users list; if list is empty, append user to an empty list
    UpdateExpression: 'set #users = list_append(#users, :newUserVal)',
    ExpressionAttributeNames: {
      '#users': 'users',
    },
    ExpressionAttributeValues: {
      ':newUserVal': [user], // this needs to be a list, list_append adds to list together
    },
    ReturnValues: 'ALL_NEW',
  };

  const res = await DB.update(updateParam).promise();
  const updatedGame = res.Attributes as Game;
  return updatedGame;
};

/**
 * Get all the games (rows) from the GamesTable.
 */
export const getAllGames = async (): Promise<Game[]> => {
  const scanParams: DocumentClient.ScanInput = {
    TableName: GAMES_TABLE,
    // AttributesToGet: attributes,
  };

  const res = await DB.scan(scanParams).promise();
  return res.Items as Game[];
};
