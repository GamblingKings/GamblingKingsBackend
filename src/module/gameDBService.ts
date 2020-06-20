import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { v4 as uuid } from 'uuid';
import { Game } from '../models/Game';
import { DEFAULT_DOCUMENT_VERSION, GAMES_TABLE } from '../constants';
import { DB } from './db';
import { getUserByConnectionId } from './userDBService';
import { GameStates } from '../types/states';
import { parseDynamoDBAttribute, parseDynamoDBItem, parseDynamoDBItemList } from '../utils/dbHelper';

/* ----------------------------------------------------------------------------
 * Interface
 * ------------------------------------------------------------------------- */
interface CreateGameParams {
  creatorConnectionId: string;
  documentClient: DocumentClient;
  gameName?: string;
  gameType?: string;
  gameVersion?: string;
}

/* ----------------------------------------------------------------------------
 * Game
 * ------------------------------------------------------------------------- */
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
  if (!user) {
    throw new Error('createGame: User cannot be empty');
  }

  const game: Game = {
    gameId: uuid(),
    host: user,
    users: [user], // put the game creator into the game initially
    gameName: gameName || '',
    gameType: gameType || '',
    gameVersion: gameVersion || '',
    state: GameStates.CREATED,
    started: false,

    // Attribute to keep track of the document version to prevent
    // concurrent update on different versions of a game document
    version: DEFAULT_DOCUMENT_VERSION,
  };

  const putParam: DocumentClient.PutItemInput = {
    TableName: GAMES_TABLE,
    Item: game,
    ReturnValues: 'ALL_OLD',
  };

  await documentClient.put(putParam).promise(); // response is empty
  return game;
};

/**
 * Get all the games (rows) from the GamesTable.
 * @param {DocumentClient} documentClient DynamoDB DocumentClient
 */
export const getAllGames = async (documentClient: DocumentClient = DB): Promise<Game[]> => {
  const scanParams: DocumentClient.ScanInput = {
    TableName: GAMES_TABLE,
  };

  const res = await documentClient.scan(scanParams).promise();
  console.log('\ngetAllGames result:', res);

  return parseDynamoDBItemList<Game>(res);
};

/**
 * Get game by the game Id.
 * @param {string} gameId game Id
 * @param {DocumentClient} documentClient DynamoDB DocumentClient
 */
export const getGameByGameId = async (
  gameId: string,
  documentClient: DocumentClient = DB,
): Promise<Game | undefined> => {
  const getParam: DocumentClient.GetItemInput = {
    TableName: GAMES_TABLE,
    Key: {
      gameId,
    },
  };

  const res = await documentClient.get(getParam).promise();
  console.log('\ngetGameByGameId result:', res);

  return parseDynamoDBItem<Game>(res);
};

/**
 * Add a user to an existing game.
 * @param {string} gameId game Id
 * @param {string} connectionId connection Id
 * @param {DocumentClient} documentClient DynamoDB DocumentClient
 */
export const addUserToGame = async (
  gameId: string,
  connectionId: string,
  documentClient: DocumentClient = DB,
): Promise<Game | undefined> => {
  // TODO: Refactor this part to reduce the number of read operations
  // Get user by connectionId
  const user = await getUserByConnectionId(connectionId, documentClient);

  // Only update if the user exist
  if (!user) {
    throw new Error('addUserToGame: user does not exist');
  }

  // Get game by gameId
  const game = await getGameByGameId(gameId, documentClient);

  if (!game) {
    throw new Error('addUserToGame: game does not exist');
  }

  // Get current game version
  const version = game.version || DEFAULT_DOCUMENT_VERSION;
  console.log(`addUserToGame: Current game version for game '${gameId}' is:`, version);

  // Get users list and check if is already in the game
  const { users } = game;
  users.forEach((userInGame) => {
    if (userInGame.connectionId === connectionId) throw Error('addUserToGame: user is already in the game');
  });
  const updatedUsers = [...users, user];

  const updateParam: DocumentClient.UpdateItemInput = {
    TableName: GAMES_TABLE,
    Key: {
      gameId,
    },
    ConditionExpression: 'version = :version',
    UpdateExpression: `
      SET #users = :updatedUsersListVal
      ADD version :incrementVersionBy
    `,
    ExpressionAttributeNames: {
      '#users': 'users',
    },
    ExpressionAttributeValues: {
      ':updatedUsersListVal': updatedUsers,
      ':version': version || DEFAULT_DOCUMENT_VERSION,
      ':incrementVersionBy': 1,
    },
    ReturnValues: 'ALL_NEW',
  };

  // Update game
  const res = await documentClient.update(updateParam).promise();
  console.log('\naddUserToGame result:', res);

  return parseDynamoDBAttribute<Game>(res);
};

/**
 * Remove user from an existing game.
 * @param gameId
 * @param {string} connectionId
 * @param {string} documentClient
 */
export const removeUserFromGame = async (
  gameId: string,
  connectionId: string,
  documentClient: DocumentClient = DB,
): Promise<Game | undefined> => {
  // TODO: Refactor this part to reduce the number of read operations
  // Get game by gameId
  const game = await getGameByGameId(gameId, documentClient);

  // Only update when the game exists
  if (!game) {
    throw new Error('removeUserFromGame: Game does not exist');
  }
  const { users } = game;

  // Only update when users list is not empty
  if (!users || users.length === 0) {
    return undefined;
  }

  // Get index of the user to be remove
  const indexToRemove = users.findIndex((user) => user.connectionId === connectionId);
  if (indexToRemove === -1) {
    // user not found
    throw new Error('removeUserFromGame: User not found');
  }

  // Get current game document version
  const version = game.version || DEFAULT_DOCUMENT_VERSION;
  console.log(`removeUserFromGame: Current game version for game '${gameId}' is:`, version);

  const updateParam: DocumentClient.UpdateItemInput = {
    TableName: GAMES_TABLE,
    Key: {
      gameId,
    },
    ConditionExpression: 'version = :version',
    UpdateExpression: `
          REMOVE #users[${indexToRemove}]
          ADD version :incrementVersionBy
        `,
    ExpressionAttributeNames: {
      '#users': 'users',
    },
    ExpressionAttributeValues: {
      ':version': version || DEFAULT_DOCUMENT_VERSION,
      ':incrementVersionBy': 1,
    },
    ReturnValues: 'ALL_NEW',
  };

  const res = await documentClient.update(updateParam).promise();
  console.log('\nremoveUserFromGame result:', res);

  return parseDynamoDBAttribute<Game>(res);
};

export const deleteGame = async (gameId: string, documentClient: DocumentClient = DB): Promise<Game | undefined> => {
  const deleteParams: DocumentClient.DeleteItemInput = {
    TableName: GAMES_TABLE,
    Key: {
      gameId,
    },
    ReturnValues: 'ALL_OLD',
  };

  const res = await documentClient.delete(deleteParams).promise();
  console.log('\ndeleteGame result:', res);

  return parseDynamoDBAttribute<Game>(res);
};

/**
 * Set game started flag to true.
 * @param {string} gameId game Id
 * @param {string} callerConnectionId caller's connection id
 * @param {DocumentClient} documentClient DynamoDB DocumentClient
 */
export const startGame = async (
  gameId: string,
  callerConnectionId: string,
  documentClient: DocumentClient = DB,
): Promise<Game | undefined> => {
  const updateParam: DocumentClient.UpdateItemInput = {
    TableName: GAMES_TABLE,
    Key: {
      gameId,
    },
    /**
     * 1. game must exist (to prevent creating a new game if the game does not exist with the given gameId)
     * 2. started attribute should be either not exist or its value should be false before setting it to true
     *    (to prevent duplicate write to the game)
     * 3. the user calling the function must be the host of the game
     */
    ConditionExpression: `
      attribute_exists(#gameIdKey) 
      AND 
      (attribute_not_exists(#startedKey) OR #startedKey = :notStartedVal)
      AND
      host.connectionId = :callerConnectionIdVal
    `,
    UpdateExpression: 'SET #startedKey = :startedVal',
    ExpressionAttributeNames: {
      '#gameIdKey': 'gameId',
      '#startedKey': 'started',
    },
    ExpressionAttributeValues: {
      ':startedVal': true,
      ':notStartedVal': false,
      ':callerConnectionIdVal': callerConnectionId,
    },
    ReturnValues: 'ALL_NEW',
  };

  // Update game
  const res = await documentClient.update(updateParam).promise();
  console.log('\nstartGame result:', res);

  return parseDynamoDBAttribute<Game>(res);
};
