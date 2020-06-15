import { AWSError, DynamoDB } from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { v4 as uuid } from 'uuid';
import { CONNECTIONS_TABLE, GAMES_TABLE } from '../constants';
import { Game } from '../models/Game';
import { User } from '../models/User';

/* ----------------------------------------------------------------------------
 * DocumentClient
 * ------------------------------------------------------------------------- */
/**
 * Default DynamoDB DocumentClient options
 */
const DEFAULT_OPTION = {
  apiVersion: '2012-08-10',
  // support empty string for attributes instead of converting them to undefined
  // see: https://aws.amazon.com/about-aws/whats-new/2020/05/amazon-dynamodb-now-supports-empty-values-for-non-key-string-and-binary-attributes-in-dynamodb-tables/
  convertEmptyValues: false,
};

/**
 * Create a DynamoDB DocumentClient instance
 */
export const getDynamoDocumentClient = (): DynamoDB.DocumentClient => {
  // For local dev
  if (process.env.IS_OFFLINE) {
    return new DynamoDB.DocumentClient({
      ...DEFAULT_OPTION,
      region: 'localhost',
      endpoint: 'http://localhost:8000',
    });
  }

  // For prod
  return new DynamoDB.DocumentClient({
    ...DEFAULT_OPTION,
    region: 'us-west-2',
  });
};

/**
 * Export DynamoDB DocumentClient instance
 */
export const DB = getDynamoDocumentClient();

/* ----------------------------------------------------------------------------
 * User
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
  if (Attributes) return Attributes as User;
  return undefined;
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
 * Note: only connectionId attribute is retrieved to save DB read cost.
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
 * Get user attributes by connection Id
 * @param {string} connectionId connection Id
 * @param {DocumentClient} documentClient
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
  const item = res.Item;

  return (item as User) || undefined;
};

export const updateUserState = async (
  connectionId: string,
  state = 'CONNECT',
  documentClient: DocumentClient = DB,
): Promise<User> => {
  const updateParam: DocumentClient.UpdateItemInput = {
    TableName: CONNECTIONS_TABLE,
    Key: {
      connectionId,
    },
    UpdateExpression: 'SET #state = :stateVal',
    ExpressionAttributeNames: {
      '#state': 'state',
    },
    ExpressionAttributeValues: {
      ':stateVal': state,
    },
    ReturnValues: 'ALL_NEW',
  };

  const res = await documentClient.update(updateParam).promise();
  console.log('\nUpdated state for user:', res);
  return res.Attributes as User;
};

/* ----------------------------------------------------------------------------
 * Game
 * ------------------------------------------------------------------------- */
interface CreateGameParams {
  creatorConnectionId: string;
  documentClient: DocumentClient;
  gameName?: string;
  gameType?: string;
  gameVersion?: string;
}
/**
 * Create a game that takes in a list of connection Ids (users) and write to the GamesTable.
 * @param creatorConnectionId creator's connection Id
 * @param {string} gameName game name
 * @param {string} gameType game type
 * @param {string} gameVersion game version
 * @param {DocumentClient} documentClient DynamoDB DocumentClient
 */
export const createGame = async ({
  creatorConnectionId,
  gameName,
  gameType,
  gameVersion,
  documentClient = DB,
}: CreateGameParams): Promise<Game> => {
  // Get user by connectionId
  const user = await getUserByConnectionId(creatorConnectionId, documentClient);

  // Create game
  if (user) {
    const game: Game = {
      gameId: uuid(),
      users: [user], // put the game creator into the game initially
      gameName: gameName || '',
      gameType: gameType || '',
      gameVersion: gameVersion || '',
    };

    const putParam: DocumentClient.PutItemInput = {
      TableName: GAMES_TABLE,
      Item: game,
      ReturnValues: 'ALL_OLD',
    };

    await documentClient.put(putParam).promise(); // response is empty
    return game;
  }

  throw new AWSError('User cannot be empty');
};

export const addUserToGame = async (
  gameId: string,
  connectionId: string,
  documentClient: DocumentClient = DB,
): Promise<Game> => {
  // Get user by connectionId
  const user = await getUserByConnectionId(connectionId, documentClient);

  const updateParam: DocumentClient.UpdateItemInput = {
    TableName: GAMES_TABLE,
    Key: {
      gameId,
    },
    // Update users list by concatenating two list (users + newUserListVal) together
    UpdateExpression: 'SET #users = list_append(#users, :newUserListVal)',
    // Prevent adding the same user to the users list.
    // If it fails, you will get ConditionalCheckFailedException from DynamoDB
    ConditionExpression: 'attribute_not_exists(#users) OR NOT contains(#users, :newUserVal)',
    ExpressionAttributeNames: {
      '#users': 'users',
    },
    ExpressionAttributeValues: {
      ':newUserVal': user,
      ':newUserListVal': [user], // this needs to be a list, list_append adds two list together
    },
    ReturnValues: 'ALL_NEW',
  };

  const res = await documentClient.update(updateParam).promise();
  console.log('\nUpdated game:', res);
  return res.Attributes as Game;
};

/**
 * Get all the games (rows) from the GamesTable.
 */
export const getAllGames = async (documentClient: DocumentClient = DB): Promise<Game[]> => {
  const scanParams: DocumentClient.ScanInput = {
    TableName: GAMES_TABLE,
    // AttributesToGet: attributes,
  };

  const res = await documentClient.scan(scanParams).promise();
  console.log('\ngetAllGames result:', res);
  const { Items } = res;
  return (Items as Game[]) || [];
};

export const getGameByGameId = async (gameId: string, documentClient: DocumentClient = DB): Promise<Game> => {
  const getParam: DocumentClient.GetItemInput = {
    TableName: GAMES_TABLE,
    Key: {
      gameId,
    },
  };

  const res = await documentClient.get(getParam).promise();
  console.log('\ngetUserByConnectionId result:', res);

  const item = res.Item;
  return (item as Game) || undefined;
};
