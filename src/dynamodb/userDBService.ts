import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { User } from '../models/User';
import { CONNECTIONS_TABLE } from '../utils/constants';
import { DB } from './db';
import { parseDynamoDBAttribute, parseDynamoDBItem, parseDynamoDBItemList } from './dbHelper';

/* ----------------------------------------------------------------------------
 * Put
 * ------------------------------------------------------------------------- */
/**
 * Save new connection with connectionId to the Connections Table.
 * @param {string} connectionId connectionId from event.requestContext
 */
export const saveConnection = async (connectionId: string): Promise<User> => {
  const putParams: DocumentClient.PutItemInput = {
    TableName: CONNECTIONS_TABLE,
    Item: {
      connectionId,
    },
    ReturnValues: 'ALL_OLD',
  };

  await DB.put(putParams).promise(); // response is empty

  return { connectionId } as User;
};

/* ----------------------------------------------------------------------------
 * Get
 * ------------------------------------------------------------------------- */
/**
 * Get all connections (rows) from the Connections Table.
 */
export const getAllConnections = async (): Promise<User[]> => {
  const scanParams: DocumentClient.ScanInput = {
    TableName: CONNECTIONS_TABLE,
    AttributesToGet: ['connectionId', 'username'], // TODO: get less attributes to save read cost
  };

  const res = await DB.scan(scanParams).promise();

  return parseDynamoDBItemList<User>(res);
};

/**
 * Get user attributes by connection Id.
 * @param {string} connectionId connection Id
 */
export const getUserByConnectionId = async (connectionId: string): Promise<User | undefined> => {
  const getParam: DocumentClient.GetItemInput = {
    TableName: CONNECTIONS_TABLE,
    Key: {
      connectionId,
    },
  };

  const res = await DB.get(getParam).promise();

  return parseDynamoDBItem<User>(res);
};

/* ----------------------------------------------------------------------------
 * Update
 * ------------------------------------------------------------------------- */
/**
 * Set username for a connection.
 * @param {string} connectionId connectionId
 * @param {string} username username
 */
export const setUsername = async (connectionId: string, username: string): Promise<User | undefined> => {
  const updateParams: DocumentClient.UpdateItemInput = {
    TableName: CONNECTIONS_TABLE,
    Key: {
      connectionId,
    },
    // user must exist (to prevent creating a new user if the user does not exist with the given connectionId)
    // and username cannot be empty string
    ConditionExpression: 'attribute_exists(#connectionIdKey) and :usernameVal <> :emptyString',
    UpdateExpression: 'SET #usernameKey = :usernameVal',
    ExpressionAttributeNames: {
      '#connectionIdKey': 'connectionId',
      '#usernameKey': 'username',
    },
    ExpressionAttributeValues: {
      ':usernameVal': username.trim(),
      ':emptyString': '',
    },
    ReturnValues: 'ALL_NEW',
  };

  const res = await DB.update(updateParams).promise();

  return parseDynamoDBAttribute<User>(res);
};

/**
 * Set gameId in the user object when user joins a game.
 * @param {string} connectionId connection Id
 * @param {string} gameId game Id
 */
export const setGameIdForUser = async (connectionId: string, gameId: string): Promise<User | undefined> => {
  const updateParam: DocumentClient.UpdateItemInput = {
    TableName: CONNECTIONS_TABLE,
    Key: {
      connectionId,
    },
    // user must exist (to prevent creating a new user if the user does not exist with the given connectionId)
    // and the gameId attribute must not exist before adding it
    ConditionExpression: 'attribute_exists(#connectionIdKey) AND attribute_not_exists(#gameIdKey)',
    UpdateExpression: 'SET #gameIdKey = :gameIdVal',
    ExpressionAttributeNames: {
      '#connectionIdKey': 'connectionId',
      '#gameIdKey': 'gameId',
    },
    ExpressionAttributeValues: {
      ':gameIdVal': gameId,
    },
    ReturnValues: 'ALL_NEW',
  };

  const res = await DB.update(updateParam).promise();

  return parseDynamoDBAttribute<User>(res);
};

/**
 * Remove game id from the user object when user leaves a game.
 * @param {string} connectionId connection Id
 */
export const removeGameIdFromUser = async (connectionId: string): Promise<User | undefined> => {
  const updateParam: DocumentClient.UpdateItemInput = {
    TableName: CONNECTIONS_TABLE,
    Key: {
      connectionId,
    },
    // user must exist (to prevent creating a new user if the user does not exist with the given connectionId)
    // and the gameId attribute must exist before removing it
    ConditionExpression: 'attribute_exists(#connectionIdKey) AND attribute_exists(#gameIdKey)',
    UpdateExpression: 'REMOVE #gameIdKey',
    ExpressionAttributeNames: {
      '#connectionIdKey': 'connectionId',
      '#gameIdKey': 'gameId',
    },
    ReturnValues: 'ALL_NEW',
  };

  const res = await DB.update(updateParam).promise();

  return parseDynamoDBAttribute<User>(res);
};

/* ----------------------------------------------------------------------------
 * Delete
 * ------------------------------------------------------------------------- */
/**
 * Remove connection by connectionId from the Connections Table.
 * @param {string} connectionId connectionId from event.requestContext
 */
export const deleteConnection = async (connectionId: string): Promise<User | undefined> => {
  const deleteParams: DocumentClient.DeleteItemInput = {
    TableName: CONNECTIONS_TABLE,
    Key: {
      connectionId,
    },
    ReturnValues: 'ALL_OLD',
  };

  const res = await DB.delete(deleteParams).promise();

  return parseDynamoDBAttribute<User>(res);
};
