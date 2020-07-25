import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { GAME_STATE_TABLE } from '../utils/constants';
import { HongKongWall } from '../games/mahjong/Wall/version/HongKongWall';
import { DB } from './db';
import { GameState, UserHand } from '../models/GameState';
import { getHandByConnectionId, parseDynamoDBAttribute, parseDynamoDBItem } from './dbHelper';

/**
 * Initialize the game by generating a mahjong wall,
 * 4 hands of mahjong, and save the initial game state to the db
 * @param {string} gameId game Id
 * @param {string} connectionIds connection Ids of all the users in a game
 */
export const initGameState = async (gameId: string, connectionIds: string[]): Promise<GameState> => {
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
    currentIndex: 13 * 4, // index of the tile array after game init
  };

  const putParam: DocumentClient.PutItemInput = {
    TableName: GAME_STATE_TABLE,
    Item: initialGame,
    ReturnValues: 'ALL_OLD',
  };

  await DB.put(putParam).promise(); // response is empty

  return initialGame;
};

/**
 * Get the current game state by game Id.
 * @param {string} gameId game Id
 */
export const getGameStateByGameId = async (gameId: string): Promise<GameState | undefined> => {
  const getParam: DocumentClient.GetItemInput = {
    TableName: GAME_STATE_TABLE,
    Key: {
      gameId,
    },
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
 * Get current the user hand for a user in the game by connection Id.
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
