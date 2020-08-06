import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { DEFAULT_HAND_LENGTH, DEFAULT_MAX_USERS_IN_GAME, GAME_STATE_TABLE } from '../utils/constants';
import { HongKongWall } from '../games/mahjong/Wall/version/HongKongWall';
import { DB } from './db';
import { GameState, UserHand } from '../models/GameState';
import { getHandByConnectionId, parseDynamoDBAttribute, parseDynamoDBItem } from './dbHelper';

/* ----------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------- */
const DEFAULT_GAME_STATE_PARAMS = [
  'gameId',
  'wall',
  'connectionIds',
  'hands',
  'dealer',
  'currentIndex',
  'currentWind',
  'currentTurn',
];

/* ----------------------------------------------------------------------------
 * Put
 * ------------------------------------------------------------------------- */
/**
 * Initialize the game by generating a mahjong wall,
 * 4 hands of mahjong, and save the initial game state to the db
 * @param {string} gameId game Id
 * @param hostConnectionId host connection Id
 * @param {string} connectionIds connection Ids of all the users in a game
 */
export const initGameState = async (
  gameId: string,
  hostConnectionId: string,
  connectionIds: string[],
): Promise<GameState> => {
  const initialWall = new HongKongWall();

  // Generate hand for each user
  const hands: UserHand[] = [];
  connectionIds.forEach((connectionId: string) => {
    const hand = {
      connectionId,
      hand: initialWall.generateHand(),
    };
    hands.push(hand);
  });

  const initialGame: GameState = {
    gameId,
    wall: initialWall.getTiles(), // array of tiles
    hands, // current hands of users TODO: can remove this attribute if not needed
    currentIndex: DEFAULT_HAND_LENGTH * DEFAULT_MAX_USERS_IN_GAME, // index of the tile array after game init
    dealer: 0,
    currentWind: 0, // Start with East
    currentTurn: 0, // Game start from host
  };

  const putParam: DocumentClient.PutItemInput = {
    TableName: GAME_STATE_TABLE,
    Item: initialGame,
    ReturnValues: 'ALL_OLD',
  };

  await DB.put(putParam).promise(); // response is empty

  return initialGame;
};

/* ----------------------------------------------------------------------------
 * Get
 * ------------------------------------------------------------------------- */
/**
 * Get the current game state by game Id.
 * @param {string} gameId game Id
 * @param {string[]} attributesToGet game attributes to be returned from db (default value: all attributes)
 */
export const getGameStateByGameId = async (
  gameId: string,
  attributesToGet: string[] = DEFAULT_GAME_STATE_PARAMS,
): Promise<GameState | undefined> => {
  const getParam: DocumentClient.GetItemInput = {
    TableName: GAME_STATE_TABLE,
    Key: {
      gameId,
    },
    ProjectionExpression: attributesToGet.join(', '),
  };

  const res = await DB.get(getParam).promise();
  console.log('\ngetGameStateByGameId result:', res);

  return parseDynamoDBItem<GameState>(res);
};

/**
 * Get the mahjong wall of a game by game Id.
 * @param {string} gameId Game Id
 */
export const getCurrentWallByGameId = async (gameId: string): Promise<string[]> => {
  const currentGameState = (await getGameStateByGameId(gameId)) as GameState;
  return currentGameState.wall;
};

/**
 * Get the current user hand for a user in the game by connection Id.
 * TODO: remove this method if decided not to save user hands to the db
 * @param {string} gameId Game Id
 * @param {string} connectionId Connection Id
 */
export const getUserHandsInGame = async (gameId: string, connectionId: string): Promise<string[]> => {
  const currentGameState = (await getGameStateByGameId(gameId)) as GameState;
  const { hands } = currentGameState;

  return getHandByConnectionId(hands, connectionId);
};

/**
 * Get the current dealer in a game.
 * @param {string} gameId Game Id
 */
export const getCurrentDealer = async (gameId: string): Promise<number | undefined> => {
  const currentState = await getGameStateByGameId(gameId, ['dealer']);
  return currentState?.dealer;
};

/**
 * Get the current wind in a game.
 * @param {string} gameId Game Id
 */
export const getCurrentWind = async (gameId: string): Promise<number | undefined> => {
  const currentState = await getGameStateByGameId(gameId, ['currentWind']);
  return currentState?.currentWind;
};

/**
 * Get the current turn in a game.
 * @param {string} gameId Game Id
 */
export const getCurrentTurn = async (gameId: string): Promise<number | undefined> => {
  const currentGameState = await getGameStateByGameId(gameId, ['currentTurn']);
  return currentGameState?.currentTurn;
};

/* ----------------------------------------------------------------------------
 * Update
 * ------------------------------------------------------------------------- */
/**
 * Increment the tile index by 1.
 * @param {string} gameId Game Id
 */
export const incrementCurrentTileIndex = async (gameId: string): Promise<GameState | undefined> => {
  const updateParam: DocumentClient.UpdateItemInput = {
    TableName: GAME_STATE_TABLE,
    Key: {
      gameId,
    },
    UpdateExpression: 'ADD #currentIndex :incrementIndexBy',
    ExpressionAttributeNames: {
      '#currentIndex': 'currentIndex',
    },
    ExpressionAttributeValues: {
      ':incrementIndexBy': 1,
    },
    ReturnValues: 'ALL_NEW',
  };

  const res = await DB.update(updateParam).promise();
  console.log('\nincrementCurrentTileIndex result:', res);

  return parseDynamoDBAttribute<GameState>(res);
};

/**
 * Draw a tile from the wall.
 * @param {string} gameId Game Id
 */
export const drawTile = async (gameId: string): Promise<string> => {
  const currentGameState = await getGameStateByGameId(gameId);
  let tileDrawn = '';

  // Draw a tile and increment index by 1
  if (currentGameState) {
    const { wall, currentIndex } = currentGameState;
    await incrementCurrentTileIndex(gameId);
    tileDrawn = wall[currentIndex];
  }

  return tileDrawn;
};

/**
 * Change dealer number in a game.
 * @param {string} gameId Game Id
 */
export const changeDealer = async (gameId: string): Promise<GameState | undefined> => {
  const currentGameState = await getGameStateByGameId(gameId);

  if (!currentGameState) {
    throw Error('changeDealer: game state not found');
  }

  const { dealer: currentDealerIndex } = currentGameState;
  let nextDealerIndex;

  // reset dealer index
  if (currentDealerIndex === 3) nextDealerIndex = 0;
  else nextDealerIndex = currentDealerIndex + 1;

  const updateParam: DocumentClient.UpdateItemInput = {
    TableName: GAME_STATE_TABLE,
    Key: {
      gameId,
    },
    ConditionExpression: ':nextDealerIndex < :maxUserCount',
    UpdateExpression: 'SET #dealer = :nextDealerIndex',
    ExpressionAttributeNames: {
      '#dealer': 'dealer',
    },
    ExpressionAttributeValues: {
      ':nextDealerIndex': nextDealerIndex,
      ':maxUserCount': DEFAULT_MAX_USERS_IN_GAME,
    },
    ReturnValues: 'ALL_NEW',
  };

  const res = await DB.update(updateParam).promise();
  console.log('\nchangeDealer result:', res);

  return parseDynamoDBAttribute<GameState>(res);
};

/**
 * Change wind number in a game.
 * @param {string} gameId Game Id
 */
export const changeWind = async (gameId: string): Promise<GameState | undefined> => {
  const currentGameState = await getGameStateByGameId(gameId);

  if (!currentGameState) {
    throw Error('changeWind: game state not found');
  }

  const { currentWind: currentWindNum } = currentGameState;
  let nextWindNum: number;

  // reset wind num
  if (currentWindNum === 3) nextWindNum = 0;
  else nextWindNum = currentWindNum + 1;

  const updateParam: DocumentClient.UpdateItemInput = {
    TableName: GAME_STATE_TABLE,
    Key: {
      gameId,
    },
    ConditionExpression: ':nextWindNum < :maxUserCount',
    UpdateExpression: 'SET #currentWindKey = :nextWindNum',
    ExpressionAttributeNames: {
      '#currentWindKey': 'currentWind',
    },
    ExpressionAttributeValues: {
      ':nextWindNum': nextWindNum,
      ':maxUserCount': DEFAULT_MAX_USERS_IN_GAME,
    },
    ReturnValues: 'ALL_NEW',
  };

  const res = await DB.update(updateParam).promise();
  console.log('\nchangeWind result:', res);

  return parseDynamoDBAttribute<GameState>(res);
};

/**
 * Change turn number in a game.
 * @param {string} gameId Game Id
 */
export const changeTurn = async (gameId: string): Promise<GameState | undefined> => {
  const currentGameState = await getGameStateByGameId(gameId);

  if (!currentGameState) {
    throw Error('changeTurn: game state not found');
  }

  const { currentTurn } = currentGameState;
  let nextTurn: number;

  // reset wind num
  if (currentTurn === 3) nextTurn = 0;
  else nextTurn = currentTurn + 1;

  const updateParam: DocumentClient.UpdateItemInput = {
    TableName: GAME_STATE_TABLE,
    Key: {
      gameId,
    },
    ConditionExpression: ':currentTurnVal < :maxUserCount',
    UpdateExpression: 'SET #currentTurnKey = :currentTurnVal',
    ExpressionAttributeNames: {
      '#currentTurnKey': 'currentTurn',
    },
    ExpressionAttributeValues: {
      ':currentTurnVal': nextTurn,
      ':maxUserCount': DEFAULT_MAX_USERS_IN_GAME,
    },
    ReturnValues: 'ALL_NEW',
  };

  const res = await DB.update(updateParam).promise();
  console.log('\nchangeTurn result:', res);

  return parseDynamoDBAttribute<GameState>(res);
};

// export const incrementPlayedTileInteraction = async (
//   gameId: string,
//   meldType: MeldEnum,
// ): Promise<GameState | undefined> => {
//   return {} as GameState;
// };

/* ----------------------------------------------------------------------------
 * Delete
 * ------------------------------------------------------------------------- */
/**
 * Delete game state by game Id.
 * @param {string} gameId Game Id
 */
export const deleteGameState = async (gameId: string): Promise<GameState | undefined> => {
  const deleteParams: DocumentClient.DeleteItemInput = {
    TableName: GAME_STATE_TABLE,
    Key: {
      gameId,
    },
    ReturnValues: 'ALL_OLD',
  };

  const res = await DB.delete(deleteParams).promise();
  console.log('\ndeleteGame result:', res);

  return parseDynamoDBAttribute<GameState>(res);
};
