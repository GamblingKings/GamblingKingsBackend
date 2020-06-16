import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { User } from '../models/User';
import { CONNECTIONS_TABLE } from '../constants';
import { DB } from './db';

/* ----------------------------------------------------------------------------
 * User DB Service
 * ------------------------------------------------------------------------- */
/**
 * Save new connection with connectionId to the ConnectionsTable.
 * @param {string} connectionId connectionId from event.requestContext
 * @param {DocumentClient} documentClient DynamoDB DocumentClient
 */
export const saveConnection = async (connectionId: string, documentClient: DocumentClient = DB): Promise<User> => {
  const putParams: DocumentClient.PutItemInput = {
    TableName: CONNECTIONS_TABLE,
    Item: {
      connectionId,
    },
    ReturnValues: 'ALL_OLD',
  };

  const res = await documentClient.put(putParams).promise(); // response is empty
  console.log('\nsaveConnection result:', res);

  return { connectionId } as User;
};

/**
 * Remove connection by connectionId from the ConnectionsTable.
 * @param {string} connectionId connectionId from event.requestContext
 * @param {DocumentClient} documentClient
 */
export const deleteConnection = async (
  connectionId: string,
  documentClient: DocumentClient = DB,
): Promise<User | undefined> => {
  const deleteParams: DocumentClient.DeleteItemInput = {
    TableName: CONNECTIONS_TABLE,
    Key: {
      connectionId,
    },
    ReturnValues: 'ALL_OLD',
  };

  const res = await documentClient.delete(deleteParams).promise();
  console.log('\ndeleteConnection result:', res);

  const { Attributes } = res;
  return (Attributes as User) || undefined;
};

/**
 * Set username for a connection.
 * @param {string} connectionId connectionId
 * @param {string} username username
 * @param {DocumentClient} documentClient DynamoDB DocumentClient
 */
export const setUsername = async (
  connectionId: string,
  username: string,
  documentClient: DocumentClient = DB,
): Promise<User> => {
  const updateParams: DocumentClient.UpdateItemInput = {
    TableName: CONNECTIONS_TABLE,
    Key: {
      connectionId,
    },
    ExpressionAttributeNames: { '#usernameKey': 'username' },
    // username cannot be empty string
    ConditionExpression: ':usernameVal <> :emptyString',
    UpdateExpression: 'SET #usernameKey = :usernameVal',
    ExpressionAttributeValues: {
      ':usernameVal': username,
      ':emptyString': '',
    },
    ReturnValues: 'ALL_NEW',
  };

  const res = await documentClient.update(updateParams).promise();
  console.log('\nsetUserName result:', res);

  const { Attributes } = res;
  return (Attributes as User) || undefined;
};

/**
 * Get all connections (rows) from the ConnectionsTable.
 * @param {DocumentClient} documentClient DynamoDB DocumentClient
 */
export const getAllConnections = async (documentClient: DocumentClient = DB): Promise<User[]> => {
  const scanParams: DocumentClient.ScanInput = {
    TableName: CONNECTIONS_TABLE,
    AttributesToGet: ['connectionId', 'username'], // TODO: get less attributes to save read cost
  };

  const res = await documentClient.scan(scanParams).promise();
  console.log('\ngetAllConnections result:', res);

  const { Items } = res;
  return (Items as User[]) || [];
};

/**
 * Get user attributes by connection Id.
 * @param {string} connectionId connection Id
 * @param {DocumentClient} documentClient DynamoDB DocumentClient
 */
export const getUserByConnectionId = async (
  connectionId: string,
  documentClient: DocumentClient = DB,
): Promise<User | undefined> => {
  const getParam: DocumentClient.GetItemInput = {
    TableName: CONNECTIONS_TABLE,
    Key: {
      connectionId,
    },
  };

  const res = await documentClient.get(getParam).promise();
  console.log('\ngetUserByConnectionId result:', res);

  const { Item } = res;
  return (Item as User) || undefined;
};
