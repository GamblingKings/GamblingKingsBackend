import * as gameStateDBFunctions from '../../dynamodb/gameStateDBService';
import {
  getCurrentWallByGameId,
  getGameStateByGameId,
  getUserHandsInGame,
  initGameState,
} from '../../dynamodb/gameStateDBService';
import {
  FAKE_CONNECTION_ID1,
  FAKE_CONNECTION_ID2,
  FAKE_CONNECTION_ID3,
  FAKE_CONNECTION_ID4,
  FAKE_GAME_ID,
} from '../testConstants';
import { DEFAULT_MAX_USERS_IN_GAME } from '../../utils/constants';
import { GameState, UserHand } from '../../models/GameState';
import { HongKongWall } from '../../games/mahjong/Wall/version/HongKongWall';
import { Tiles } from '../../games/mahjong/Tile/Tiles';
import { TileMapper } from '../../games/mahjong/Tile/map/TileMapper';

const CONNECTION_IDS = [FAKE_CONNECTION_ID1, FAKE_CONNECTION_ID2, FAKE_CONNECTION_ID3, FAKE_CONNECTION_ID4];
const MAX_WALL_LENGTH = 144;
const DEFAULT_HAND_LENGTH = 13;

/* ----------------------------------------------------------------------------
 * Test initGameState
 * ------------------------------------------------------------------------- */
describe('test initGameState', () => {
  test('it should init a game with a wall and 4 hands to users', async () => {
    const response = await initGameState(FAKE_GAME_ID, CONNECTION_IDS);

    // Test game Id and remaining tiles in the wall
    const { gameId, wall, hands } = response;
    expect(gameId).toBe(FAKE_GAME_ID);
    const remainingWallLength = MAX_WALL_LENGTH - DEFAULT_HAND_LENGTH * DEFAULT_MAX_USERS_IN_GAME;
    expect(wall.getTiles()).toHaveLength(remainingWallLength);

    // Test hands
    const [hand1, hand2, hand3, hand4] = hands;

    expect(hand1.connectionId).toBe(FAKE_CONNECTION_ID1);
    expect(JSON.parse(hand1.hand)).toHaveLength(DEFAULT_HAND_LENGTH);

    expect(hand2.connectionId).toBe(FAKE_CONNECTION_ID2);
    expect(JSON.parse(hand2.hand)).toHaveLength(DEFAULT_HAND_LENGTH);

    expect(hand3.connectionId).toBe(FAKE_CONNECTION_ID3);
    expect(JSON.parse(hand3.hand)).toHaveLength(DEFAULT_HAND_LENGTH);

    expect(hand4.connectionId).toBe(FAKE_CONNECTION_ID4);
    expect(JSON.parse(hand4.hand)).toHaveLength(DEFAULT_HAND_LENGTH);
  });
});

/* ----------------------------------------------------------------------------
 * Test getGameStateByGameId, getCurrentWallByGameId, and getUserHandInGame
 * ------------------------------------------------------------------------- */
describe('test getGameStateByGameId, getCurrentWallByGameId, getUserHandInGame', () => {
  let gameState: GameState;
  let gameId: string;
  let wall: HongKongWall;
  let hands: UserHand[];

  // Spies
  let mapTileObjToTilesClassSpy: jest.SpyInstance;
  let getGameStateByGameIdSpy: jest.SpyInstance;

  beforeEach(async () => {
    gameState = await initGameState(FAKE_GAME_ID, CONNECTION_IDS);
    gameId = gameState.gameId;
    wall = gameState.wall;
    hands = gameState.hands;

    mapTileObjToTilesClassSpy = jest.spyOn(gameStateDBFunctions, 'mapTileObjToTilesClass');
    getGameStateByGameIdSpy = jest.spyOn(gameStateDBFunctions, 'getGameStateByGameId');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('it should get the game state of a game by game Id', async () => {
    const response = await getGameStateByGameId(gameId);
    console.log(response);
    const expectedResponse = {
      gameId,
      wall,
      hands,
    };

    // Test function calls
    expect(mapTileObjToTilesClassSpy).toHaveBeenCalledTimes(1);
    expect(getGameStateByGameIdSpy).toHaveBeenCalledTimes(1);

    // Test response
    expect(response).toStrictEqual(expectedResponse);
  });

  test('it should get the correct wall object from the game state using getGameStateByGameId', async () => {
    const response = await getGameStateByGameId(gameId);

    // Test function calls
    expect(mapTileObjToTilesClassSpy).toHaveBeenCalledTimes(1);
    expect(getGameStateByGameIdSpy).toHaveBeenCalledTimes(1);

    // Test response
    expect(response.wall).toBeInstanceOf(HongKongWall);
    expect(response.wall.draw()).toBeInstanceOf(Tiles);
    expect(response.wall.getTiles()).toHaveLength(92 - 1);
  });

  test('it should get the correct hands from the game state using getGameStateByGameId', async () => {
    const response = await getGameStateByGameId(gameId);

    // Test function calls
    expect(mapTileObjToTilesClassSpy).toHaveBeenCalledTimes(1);
    expect(getGameStateByGameIdSpy).toHaveBeenCalledTimes(1);

    // Test response
    const { hands: userHands } = response;
    expect(userHands).toHaveLength(4);

    const { connectionId, hand: userHandJSON } = userHands[0] as UserHand;
    expect(connectionId).toBe(FAKE_CONNECTION_ID1);

    const userHand = JSON.parse(userHandJSON);
    const mapperKeys = Object.keys(TileMapper);
    expect(userHand).toHaveLength(13);

    userHand.forEach((tileStringDef: string) => expect(mapperKeys.includes(tileStringDef)).toBeTruthy());
  });

  test('it should get the current wall from the game state using getCurrentWallByGameId', async () => {
    const response = await getCurrentWallByGameId(gameId);

    // Test function calls
    expect(mapTileObjToTilesClassSpy).toHaveBeenCalledTimes(1);
    expect(getGameStateByGameIdSpy).toHaveBeenCalledTimes(1);

    // Test response
    expect(response).toStrictEqual(wall);
  });

  test('it should get current user hands from the game state using getUserHandsInGame', async () => {
    const response1 = await getUserHandsInGame(gameId, FAKE_CONNECTION_ID1);
    const response2 = await getUserHandsInGame(gameId, FAKE_CONNECTION_ID2);
    const response3 = await getUserHandsInGame(gameId, FAKE_CONNECTION_ID3);
    const response4 = await getUserHandsInGame(gameId, FAKE_CONNECTION_ID4);

    // Test function calls
    expect(mapTileObjToTilesClassSpy).toHaveBeenCalledTimes(4);
    expect(getGameStateByGameIdSpy).toHaveBeenCalledTimes(4);

    // Test response
    const expectedResponse1 = hands[0].hand;
    const expectedResponse2 = hands[1].hand;
    const expectedResponse3 = hands[2].hand;
    const expectedResponse4 = hands[3].hand;
    expect(response1).toStrictEqual(expectedResponse1);
    expect(response2).toStrictEqual(expectedResponse2);
    expect(response3).toStrictEqual(expectedResponse3);
    expect(response4).toStrictEqual(expectedResponse4);
  });
});
