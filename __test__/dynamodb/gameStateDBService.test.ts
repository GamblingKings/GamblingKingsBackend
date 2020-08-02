import * as gameStateDBFunctions from '../../src/dynamodb/gameStateDBService';
import {
  changeDealer,
  changeTurn,
  changeWind,
  drawTile,
  getCurrentDealer,
  getCurrentTurn,
  getCurrentWallByGameId,
  getCurrentWind,
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
  NON_EXISTING_GAME_ID,
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
    const response = await initGameState(FAKE_GAME_ID, FAKE_CONNECTION_ID1, CONNECTION_IDS);

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
    gameState = await initGameState(FAKE_GAME_ID, FAKE_CONNECTION_ID1, CONNECTION_IDS);
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
      currentTurn: 0,
      currentWind: 0,
      dealer: 0,
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
    gameState = await initGameState(FAKE_GAME_ID, FAKE_CONNECTION_ID1, CONNECTION_IDS);
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
    gameState = await initGameState(FAKE_GAME_ID, FAKE_CONNECTION_ID1, CONNECTION_IDS);
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

/* ----------------------------------------------------------------------------
 * Test changeDealer, getCurrentDealer
 * ------------------------------------------------------------------------- */
describe('test changeDealer, getCurrentDealer', () => {
  let gameState: GameState;
  let gameId: string;
  let currentDealerIndex: number;

  // Spy
  let changeDealerSpy: jest.SpyInstance;
  let getDealerSpy: jest.SpyInstance;

  beforeEach(async () => {
    gameState = await initGameState(FAKE_GAME_ID, FAKE_CONNECTION_ID1, CONNECTION_IDS);
    gameId = gameState.gameId;
    currentDealerIndex = gameState.dealer;

    changeDealerSpy = jest.spyOn(gameStateDBFunctions, 'changeDealer');
    getDealerSpy = jest.spyOn(gameStateDBFunctions, 'getCurrentDealer');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('it should change the dealer to the next available index', async () => {
    // Initial dealer should be user at the 0 index
    expect(currentDealerIndex).toBe(0);
    expect(await getCurrentDealer(gameId)).toBe(0);

    const response = (await changeDealer(gameId)) as GameState;

    // Test function call
    expect(changeDealerSpy).toHaveBeenCalledTimes(1);
    expect(getDealerSpy).toHaveBeenCalledTimes(1);

    // Test response
    expect(response.dealer).toBe(1);
    expect(await getCurrentDealer(gameId)).toBe(1);
  });

  test('it should reset index to 0 when max index is reached', async () => {
    // Initial dealer should be user at the 0 index
    expect(currentDealerIndex).toBe(0);
    expect(await getCurrentDealer(gameId)).toBe(0);

    await changeDealer(gameId);
    await changeDealer(gameId);
    await changeDealer(gameId);
    const response = (await changeDealer(gameId)) as GameState;

    // Test function call
    expect(changeDealerSpy).toHaveBeenCalledTimes(4);
    expect(getDealerSpy).toHaveBeenCalledTimes(1);

    // Test response
    expect(response.dealer).toBe(0);
    expect(await getCurrentDealer(gameId)).toBe(0);
  });

  test('it should throw error when the game does not exist', async () => {
    // Initial dealer should be user at the 0 index
    expect(currentDealerIndex).toBe(0);
    expect(await getCurrentDealer(gameId)).toBe(0);

    const func = changeDealer(NON_EXISTING_GAME_ID);
    const errorMsg = 'changeDealer: game state not found';

    // Test function call
    expect(changeDealerSpy).toHaveBeenCalledTimes(1);
    expect(getDealerSpy).toHaveBeenCalledTimes(1);

    // Test response
    await expect(func).rejects.toThrow(errorMsg);
    expect(await getCurrentDealer(gameId)).toBe(0);
  });
});

/* ----------------------------------------------------------------------------
 * Test changeWind, getCurrentWind
 * ------------------------------------------------------------------------- */
describe('test changeWind, getCurrentWind', () => {
  let gameState: GameState;
  let gameId: string;
  let currentWindNum: number;

  // Spy
  let changeWindSpy: jest.SpyInstance;
  let getWindSpy: jest.SpyInstance;

  beforeEach(async () => {
    gameState = await initGameState(FAKE_GAME_ID, FAKE_CONNECTION_ID1, CONNECTION_IDS);
    gameId = gameState.gameId;
    currentWindNum = gameState.currentWind;

    changeWindSpy = jest.spyOn(gameStateDBFunctions, 'changeWind');
    getWindSpy = jest.spyOn(gameStateDBFunctions, 'getCurrentWind');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('it should change to the next wind number', async () => {
    // Initial dealer should be user at the 0 index
    expect(currentWindNum).toBe(0);
    expect(await getCurrentWind(gameId)).toBe(0);

    const response = (await changeWind(gameId)) as GameState;

    // Test function call
    expect(changeWindSpy).toHaveBeenCalledTimes(1);
    expect(getWindSpy).toHaveBeenCalledTimes(1);

    // Test response
    expect(response.currentWind).toBe(1);
    expect(await getCurrentWind(gameId)).toBe(1);
  });

  test('it should reset index to 0 when max wind number is reached', async () => {
    // Initial dealer should be user at the 0 index
    expect(currentWindNum).toBe(0);
    expect(await getCurrentWind(gameId)).toBe(0);

    await changeWind(gameId);
    await changeWind(gameId);
    await changeWind(gameId);
    const response = (await changeWind(gameId)) as GameState;

    // Test function call
    expect(changeWindSpy).toHaveBeenCalledTimes(4);
    expect(getWindSpy).toHaveBeenCalledTimes(1);

    // Test response
    expect(response.currentWind).toBe(0);
    expect(await getCurrentWind(gameId)).toBe(0);
  });

  test('it should throw error when the game does not exist', async () => {
    // Initial dealer should be user at the 0 index
    expect(currentWindNum).toBe(0);
    expect(await getCurrentWind(gameId)).toBe(0);

    const func = changeWind(NON_EXISTING_GAME_ID);
    const errorMsg = 'changeWind: game state not found';

    // Test function call
    expect(changeWindSpy).toHaveBeenCalledTimes(1);
    expect(getWindSpy).toHaveBeenCalledTimes(1);

    // Test response
    await expect(func).rejects.toThrow(errorMsg);
    expect(await getCurrentWind(gameId)).toBe(0);
  });
});

/* ----------------------------------------------------------------------------
 * Test changeTurn, getCurrentTurn
 * ------------------------------------------------------------------------- */
describe('test changeTurn, getCurrentTurn', () => {
  let gameState: GameState;
  let gameId: string;
  let currentTurn: number;

  // Spy
  let changeTurnSpy: jest.SpyInstance;

  beforeEach(async () => {
    gameState = await initGameState(FAKE_GAME_ID, FAKE_CONNECTION_ID1, CONNECTION_IDS);
    gameId = gameState.gameId;
    currentTurn = gameState.currentTurn;

    changeTurnSpy = jest.spyOn(gameStateDBFunctions, 'changeTurn');
  });

  afterEach(() => {
    changeTurnSpy.mockRestore();
  });

  test('it should update turn', async () => {
    expect(currentTurn).toBe(0);
    expect(await getCurrentTurn(gameId)).toBe(0);

    const response = (await changeTurn(gameId)) as GameState;

    // Test function call
    expect(changeTurnSpy).toHaveBeenCalledTimes(1);

    // Test response
    expect(response.currentTurn).toBe(1);
    expect(await getCurrentTurn(gameId)).toBe(1);
  });

  test('it should fail if game does not exist', async () => {
    expect(currentTurn).toBe(0);
    expect(await getCurrentTurn(gameId)).toBe(0);

    const func = changeTurn(NON_EXISTING_GAME_ID);
    const errorMsg = 'changeTurn: game state not found';

    // Test function call
    expect(changeTurnSpy).toHaveBeenCalledTimes(1);

    // Test response
    await expect(func).rejects.toThrow(errorMsg);
    expect(await getCurrentTurn(gameId)).toBe(0);
  });
});
