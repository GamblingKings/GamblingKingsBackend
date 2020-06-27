import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { GAME_STATE_TABLE } from '../utils/constants';
import { HongKongWall } from '../games/mahjong/Wall/version/HongKongWall';
import { DB } from './db';
import { GameState, UserHand } from '../models/GameState';
import { getHandByConnectionId, parseDynamoDBItem } from './dbHelper';
import { Wall } from '../games/mahjong/Wall/Wall';
import { SimpleTileTypes } from '../games/mahjong/Tile/types/SimpleTileTypes';
import { SimpleTiles } from '../games/mahjong/Tile/SimpleTiles';
import { BonusTileTypes } from '../games/mahjong/Tile/types/BonusTileTypes';
import { HonorTileTypes } from '../games/mahjong/Tile/types/HonorTileTypes';
import { BonusTiles } from '../games/mahjong/Tile/BonusTiles';
import { HonorTiles } from '../games/mahjong/Tile/HonorTiles';
import { Tiles } from '../games/mahjong/Tile/Tiles';

/* ----------------------------------------------------------------------------
 * Helper functions
 * Note: this is a hack to parse wall object returned from DynamoDB and load
 *       it into an instance of a wall object (e.g. HongKongWall). Move these
 *       to somewhere else when done refining.
 * ------------------------------------------------------------------------- */
interface ITile {
  type: string;
  value: number;
}

interface IWall {
  tiles: ITile[];
}

interface IGameState {
  wall: IWall;
  gameId: string;
  hands: UserHand[];
}

export const mapTileObjToTilesClass = (tiles: ITile[]): Tiles[] => {
  return tiles.map((tile: ITile) => {
    const { type, value } = tile;

    let properTile;
    switch (type) {
      case SimpleTileTypes.DOT:
      case SimpleTileTypes.BAMBOO:
      case SimpleTileTypes.CHARACTER:
        properTile = new SimpleTiles(type, value);
        break;
      case BonusTileTypes.FLOWER:
      case BonusTileTypes.SEASON:
        properTile = new BonusTiles(type, value);
        break;
      case HonorTileTypes.NORTH:
      case HonorTileTypes.SOUTH:
      case HonorTileTypes.WEST:
      case HonorTileTypes.EAST:
      case HonorTileTypes.REDDRAGON:
      case HonorTileTypes.GREENDRAGON:
      case HonorTileTypes.WHITEDRAGON:
        properTile = new HonorTiles(type);
        break;
      default:
        throw new Error(`Tile is not of proper type: ${tile}`);
    }

    return properTile;
  });
};

export const initGameState = async (gameId: string, connectionIds: string[]): Promise<GameState> => {
  const initialWall = new HongKongWall();

  // Parse hand
  const hands: UserHand[] = [];
  connectionIds.forEach((connectionId: string) => {
    const hand = {
      connectionId,
      hand: JSON.stringify(initialWall.generateHandAsStringDefs()),
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

  await DB.put(putParam).promise(); // response is empty

  return initialGame;
};

export const getGameStateByGameId = async (gameId: string): Promise<GameState> => {
  const getParam: DocumentClient.GetItemInput = {
    TableName: GAME_STATE_TABLE,
    Key: {
      gameId,
    },
  };

  const res = await DB.get(getParam).promise();
  console.log('\ngetGameStateByGameId result:', res);

  const gameState = parseDynamoDBItem<IGameState>(res) as IGameState;

  // Map tiles into wall
  const wall = new HongKongWall(); // TODO: change this to the parent class later on
  let tiles: Tiles[];
  if (gameState) {
    const tileObjs = gameState.wall.tiles;
    tiles = mapTileObjToTilesClass(tileObjs);

    wall.setTiles(tiles);
    return {
      ...gameState,
      wall,
      hands: <UserHand[]>gameState.hands,
    };
  }

  return gameState as GameState;
};

export const getCurrentWallByGameId = async (gameId: string): Promise<Wall> => {
  const currentGameState = (await getGameStateByGameId(gameId)) as GameState;
  return currentGameState.wall;
};

export const getUserHandsInGame = async (gameId: string, connectionId: string): Promise<string> => {
  const currentGameState = (await getGameStateByGameId(gameId)) as GameState;
  const { hands } = currentGameState;

  return getHandByConnectionId(hands, connectionId);
};
