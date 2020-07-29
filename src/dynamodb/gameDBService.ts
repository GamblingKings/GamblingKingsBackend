import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { v4 as uuid } from 'uuid';
import { Game } from '../models/Game';
import { DEFAULT_DOCUMENT_VERSION, DEFAULT_MAX_USERS_IN_GAME, GAMES_TABLE } from '../utils/constants';
import { DB } from './db';
import { getUserByConnectionId } from './userDBService';
import { GameStates } from '../enums/states';
import { parseDynamoDBAttribute, parseDynamoDBItem, parseDynamoDBItemList } from './dbHelper';

/* ----------------------------------------------------------------------------
 * Interface
 * ------------------------------------------------------------------------- */
interface CreateGameParams {
  creatorConnectionId: string;
  gameName?: string;
  gameType?: string;
  gameVersion?: string;
}

/* ----------------------------------------------------------------------------
 * Game
 * ------------------------------------------------------------------------- */
/**
 * Create a game that takes in a list of connection Ids (users) and write to the Games Table.
 * @param creatorConnectionId creator's connection Id
 * @param {string} gameName game name
 * @param {string} gameType game type
 * @param {string} gameVersion game version
 */
export const createGame = async ({
  creatorConnectionId,
  gameName,
  gameType,
  gameVersion,
}: CreateGameParams): Promise<Game> => {
  // Get user by connectionId
  const user = await getUserByConnectionId(creatorConnectionId);

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
    gameLoadedCount: 0,

    // Attribute to keep track of the document version to prevent
    // concurrent update on different versions of a game document
    version: DEFAULT_DOCUMENT_VERSION,
  };

  const putParam: DocumentClient.PutItemInput = {
    TableName: GAMES_TABLE,
    Item: game,
    ReturnValues: 'ALL_OLD',
  };

  await DB.put(putParam).promise(); // response is empty
  return game;
};

/**
 * Get all the games (rows) from the Games Table.
 */
export const getAllGames = async (): Promise<Game[]> => {
  const scanParams: DocumentClient.ScanInput = {
    TableName: GAMES_TABLE,
  };

  const res = await DB.scan(scanParams).promise();
  console.log('\ngetAllGames result:', res);

  return parseDynamoDBItemList<Game>(res);
};

/**
 * Get game by the game Id.
 * @param {string} gameId game Id
 */
export const getGameByGameId = async (gameId: string): Promise<Game | undefined> => {
  const getParam: DocumentClient.GetItemInput = {
    TableName: GAMES_TABLE,
    Key: {
      gameId,
    },
  };

  const res = await DB.get(getParam).promise();
  console.log('\ngetGameByGameId result:', res);

  return parseDynamoDBItem<Game>(res);
};

/**
 * Add a user to an existing game.
 * @param {string} gameId game Id
 * @param {string} connectionId connection Id
 */
export const addUserToGame = async (gameId: string, connectionId: string): Promise<Game | undefined> => {
  // TODO: Refactor this part to reduce the number of read operations
  // Get user by connectionId
  const user = await getUserByConnectionId(connectionId);

  // Only update if the user exist
  if (!user) {
    throw new Error('addUserToGame: user does not exist');
  }

  // Get game by gameId
  const game = await getGameByGameId(gameId);

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
  const res = await DB.update(updateParam).promise();
  console.log('\naddUserToGame result:', res);

  return parseDynamoDBAttribute<Game>(res);
};

/**
 * Remove user from an existing game.
 * @param gameId
 * @param {string} connectionId
 */
export const removeUserFromGame = async (gameId: string, connectionId: string): Promise<Game | undefined> => {
  // TODO: Refactor this part to reduce the number of read operations
  // Get game by gameId
  const game = await getGameByGameId(gameId);

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

  const res = await DB.update(updateParam).promise();
  console.log('\nremoveUserFromGame result:', res);

  return parseDynamoDBAttribute<Game>(res);
};

/**
 * Delete game from Games Table.
 * @param {string} gameId game Id
 */
export const deleteGame = async (gameId: string): Promise<Game | undefined> => {
  const deleteParams: DocumentClient.DeleteItemInput = {
    TableName: GAMES_TABLE,
    Key: {
      gameId,
    },
    ReturnValues: 'ALL_OLD',
  };

  const res = await DB.delete(deleteParams).promise();
  console.log('\ndeleteGame result:', res);

  return parseDynamoDBAttribute<Game>(res);
};

/**
 * Set game started flag to true.
 * @param {string} gameId game Id
 * @param {string} callerConnectionId caller's connection id
 */
export const startGame = async (gameId: string, callerConnectionId: string): Promise<Game | undefined> => {
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
  const res = await DB.update(updateParam).promise();
  console.log('\nstartGame result:', res);

  return parseDynamoDBAttribute<Game>(res);
};

export const incrementGameLoadedCount = async (gameId: string): Promise<Game | undefined> => {
  const updateParam: DocumentClient.UpdateItemInput = {
    TableName: GAMES_TABLE,
    Key: {
      gameId,
    },
    /**
     * 1. Game must exists
     * 2. gameLoadedCount must be less than 4 (its < 4 because when the count already reach 4,
     *    the next increment should fail)
     */
    ConditionExpression: `
      attribute_exists(#gameIdKey)
      AND
      (attribute_exists(#gameLoadedCountKey) AND #gameLoadedCountKey < :maxUserCount)
    `,
    UpdateExpression: `
      ADD #gameLoadedCountKey :incrementCountBy
    `,
    ExpressionAttributeNames: {
      '#gameIdKey': 'gameId',
      '#gameLoadedCountKey': 'gameLoadedCount',
    },
    ExpressionAttributeValues: {
      ':incrementCountBy': 1,
      ':maxUserCount': DEFAULT_MAX_USERS_IN_GAME,
    },
    ReturnValues: 'ALL_NEW',
  };

  const res = await DB.update(updateParam).promise();
  console.log('\nincrementUserReadyCount result:', res);

  return parseDynamoDBAttribute<Game>(res);
};
