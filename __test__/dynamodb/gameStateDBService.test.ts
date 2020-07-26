import * as gameStateDBFunctions from '../../src/dynamodb/gameStateDBService';
import {
  drawTile,
  getCurrentWallByGameId,
  getGameStateByGameId,
  getUserHandsInGame,
  incrementCurrentTileIndex,
  initGameState,
} from '../../src/dynamodb/gameStateDBService';
import {
  FAKE_CONNECTION_ID1,
  FAKE_CONNECTION_ID2,
  FAKE_CONNECTION_ID3,
  FAKE_CONNECTION_ID4,
  FAKE_GAME_ID,
} from '../testConstants';
import { DEFAULT_MAX_USERS_IN_GAME } from '../../src/utils/constants';
import { GameState, UserHand } from '../../src/models/GameState';
import { TileMapper } from '../../src/games/mahjong/Tile/map/TileMapper';

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
    expect(wall).toHaveLength(MAX_WALL_LENGTH);

    // Test hands
    const [hand1, hand2, hand3, hand4] = hands;

    expect(hand1.connectionId).toBe(FAKE_CONNECTION_ID1);
    expect(hand1.hand).toHaveLength(DEFAULT_HAND_LENGTH);

    expect(hand2.connectionId).toBe(FAKE_CONNECTION_ID2);
    expect(hand2.hand).toHaveLength(DEFAULT_HAND_LENGTH);

    expect(hand3.connectionId).toBe(FAKE_CONNECTION_ID3);
    expect(hand3.hand).toHaveLength(DEFAULT_HAND_LENGTH);

    expect(hand4.connectionId).toBe(FAKE_CONNECTION_ID4);
    expect(hand4.hand).toHaveLength(DEFAULT_HAND_LENGTH);
  });
});

/* ----------------------------------------------------------------------------
 * Test getGameStateByGameId, getCurrentWallByGameId, and getUserHandInGame
 * ------------------------------------------------------------------------- */
describe('test getGameStateByGameId, getCurrentWallByGameId, getUserHandInGame', () => {
  let gameState: GameState;
  let gameId: string;
  let wall: string[];
  let hands: UserHand[];

  // Spies
  let getGameStateByGameIdSpy: jest.SpyInstance;

  beforeEach(async () => {
    gameState = await initGameState(FAKE_GAME_ID, CONNECTION_IDS);
    gameId = gameState.gameId;
    wall = gameState.wall;
    hands = gameState.hands;

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
      currentIndex: DEFAULT_HAND_LENGTH * DEFAULT_MAX_USERS_IN_GAME,
    };

    // Test function calls
    expect(getGameStateByGameIdSpy).toHaveBeenCalledTimes(1);

    // Test response
    expect(response).toStrictEqual(expectedResponse);
  });

  test('it should get the correct wall as string array from the game state using getGameStateByGameId', async () => {
    const response = (await getGameStateByGameId(gameId)) as GameState;

    // Test function calls
    expect(getGameStateByGameIdSpy).toHaveBeenCalledTimes(1);

    // Test response
    expect(response.wall).toHaveLength(MAX_WALL_LENGTH);
  });

  test('it should get the correct hands from the game state using getGameStateByGameId', async () => {
    const response = await getGameStateByGameId(gameId);

    // Test function calls
    expect(getGameStateByGameIdSpy).toHaveBeenCalledTimes(1);

    // Test response
    const { hands: userHands } = response as GameState;
    expect(userHands).toHaveLength(4);

    const { connectionId, hand } = userHands[0] as UserHand;
    expect(connectionId).toBe(FAKE_CONNECTION_ID1);

    const mapperKeys = Object.keys(TileMapper);
    expect(hand).toHaveLength(13);

    hand.forEach((tileStringDef: string) => expect(mapperKeys.includes(tileStringDef)).toBeTruthy());
  });

  test('it should get the current wall from the game state using getCurrentWallByGameId', async () => {
    const response = await getCurrentWallByGameId(gameId);

    // Test function calls
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

/* ----------------------------------------------------------------------------
 * Test incrementCurrentTileIndex
 * ------------------------------------------------------------------------- */
describe('test incrementCurrentTileIndex', () => {
  let gameState: GameState;
  let gameId: string;
  let currentIndex: number;

  // Spies
  let incrementCurrentTileIndexSpy: jest.SpyInstance;
  let getGameStateByGameIdSpy: jest.SpyInstance;

  beforeEach(async () => {
    gameState = await initGameState(FAKE_GAME_ID, CONNECTION_IDS);
    gameId = gameState.gameId;
    currentIndex = gameState.currentIndex;

    incrementCurrentTileIndexSpy = jest.spyOn(gameStateDBFunctions, 'incrementCurrentTileIndex');
    getGameStateByGameIdSpy = jest.spyOn(gameStateDBFunctions, 'getGameStateByGameId');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('it should increment tile index for the wall', async () => {
    const initialIndex = DEFAULT_HAND_LENGTH * DEFAULT_MAX_USERS_IN_GAME;
    expect(currentIndex).toBe(initialIndex);
    await incrementCurrentTileIndex(gameId);
    await incrementCurrentTileIndex(gameId);

    // Test response
    const newGameState = (await getGameStateByGameId(gameId)) as GameState;
    expect(newGameState.currentIndex).toBe(initialIndex + 2);

    // Test function calls
    expect(incrementCurrentTileIndexSpy).toHaveBeenCalledTimes(2);
    expect(getGameStateByGameIdSpy).toHaveBeenCalledTimes(1);
  });
});

/* ----------------------------------------------------------------------------
 * Test drawsTile
 * ------------------------------------------------------------------------- */
describe('test drawsTile', () => {
  let gameState: GameState;
  let gameId: string;
  let wall: string[];
  let currentIndex: number;

  // Spies
  let drawTileSpy: jest.SpyInstance;
  let getGameStateByGameIdSpy: jest.SpyInstance;

  beforeEach(async () => {
    gameState = await initGameState(FAKE_GAME_ID, CONNECTION_IDS);
    gameId = gameState.gameId;
    wall = gameState.wall;
    currentIndex = gameState.currentIndex;

    drawTileSpy = jest.spyOn(gameStateDBFunctions, 'drawTile');
    getGameStateByGameIdSpy = jest.spyOn(gameStateDBFunctions, 'getGameStateByGameId');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('it should draw tiles from the wall based on the current index', async () => {
    const tileToBeDrawn = wall[currentIndex];
    const tileDrawn = await drawTile(gameId);
    const newGameState = (await getGameStateByGameId(gameId)) as GameState;

    // Test function calls
    expect(drawTileSpy).toHaveBeenCalledTimes(1);
    expect(getGameStateByGameIdSpy).toHaveBeenCalledTimes(2);

    // Test response
    expect(tileDrawn).toBe(tileToBeDrawn);
    expect(newGameState.currentIndex).toBe(currentIndex + 1);
  });
});
