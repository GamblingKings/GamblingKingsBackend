import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { GAME_STATE_TABLE } from '../../constants';
import { HongKongWall } from '../mahjong/Wall/version/HongKongWall';
import { DB } from './db';
import { GameState, UserHand } from '../../models/GameState';
import { getHandByConnectionId, parseDynamoDBItem } from '../../utils/dbHelper';
import { Wall } from '../mahjong/Wall/Wall';

export const initGameState = async (gameId: string, connectionIds: string[]): Promise<GameState> => {
  const initialWall = new HongKongWall();
  const hands: UserHand[] = [];
  connectionIds.forEach((connectionId: string) => {
    const hand = {
      connectionId,
      hand: JSON.stringify(initialWall.generateHand()),
    };
    hands.push(hand);
  });

  const initialGame: GameState = {
    gameId,
    wall: initialWall,
    hands,
  };

  const putParam: DocumentClient.PutItemInput = {
    TableName: GAME_STATE_TABLE,
    Item: initialGame,
    ReturnValues: 'ALL_OLD',
  };

  const res = await DB.put(putParam).promise();
  console.log('initGameState:', res);

  return initialGame;
};

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

export const getCurrentWallByGameId = async (gameId: string): Promise<Wall> => {
  const currentGameState = (await getGameStateByGameId(gameId)) as GameState;
  return currentGameState.wall;
};

export const getUserHandInGame = async (gameId: string, connectionId: string): Promise<string> => {
  const currentGameState = (await getGameStateByGameId(gameId)) as GameState;
  const { hands } = currentGameState;

  return getHandByConnectionId(hands, connectionId);
};
