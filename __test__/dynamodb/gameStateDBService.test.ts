import * as gameStateDBFunctions from '../../src/dynamodb/gameStateDBService';
import {
  changeDealer,
  changeWind,
  drawTile,
  getCurrentDealer,
  getCurrentPlayedTile,
  getCurrentWallByGameId,
  getCurrentWind,
  getGameStateByGameId,
  getInteractionCount,
  getUserHandsInGame,
  incrementCurrentTileIndex,
  initGameState,
  resetPlayedTileInteraction,
  setPlayedTileInteraction,
} from '../../src/dynamodb/gameStateDBService';
import {
  CONDITIONAL_FAILED_MSG,
  FAKE_CONNECTION_ID1,
  FAKE_CONNECTION_ID2,
  FAKE_CONNECTION_ID3,
  FAKE_CONNECTION_ID4,
  FAKE_GAME_ID,
  NON_EXISTING_GAME_ID,
  TEST_TILES_CONSECUTIVE,
  TEST_TILES_TRIPLET,
} from '../testConstants';
import { DEFAULT_HAND_LENGTH, DEFAULT_MAX_USERS_IN_GAME, MAX_WALL_LENGTH } from '../../src/utils/constants';
import { GameState, PlayedTile, UserHand } from '../../src/models/GameState';
import { TileMapper } from '../../src/games/mahjong/Tile/map/TileMapper';
import { MeldEnum } from '../../src/enums/MeldEnum';

const CONNECTION_IDS = [FAKE_CONNECTION_ID1, FAKE_CONNECTION_ID2, FAKE_CONNECTION_ID3, FAKE_CONNECTION_ID4];

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
    expect(hand).toHaveLength(DEFAULT_HAND_LENGTH);

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
    gameState = await initGameState(FAKE_GAME_ID, CONNECTION_IDS);
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
    gameState = await initGameState(FAKE_GAME_ID, CONNECTION_IDS);
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
 * Test setPlayedTileInteraction, getCurrentPlayedTile, getInteractionCount
 * ------------------------------------------------------------------------- */
describe('test setPlayedTileInteraction, getCurrentPlayedTile, getInteractionCount', () => {
  let gameState: GameState;
  let gameId: string;

  let setPlayedTileInteractionSpy: jest.SpyInstance;
  let getInteractionCountSpy: jest.SpyInstance;
  let getCurrentPlayedTileSpy: jest.SpyInstance;

  beforeEach(async () => {
    gameState = await initGameState(FAKE_GAME_ID, CONNECTION_IDS);
    gameId = gameState.gameId;

    setPlayedTileInteractionSpy = jest.spyOn(gameStateDBFunctions, 'setPlayedTileInteraction');
    getInteractionCountSpy = jest.spyOn(gameStateDBFunctions, 'getInteractionCount');
    getCurrentPlayedTileSpy = jest.spyOn(gameStateDBFunctions, 'getCurrentPlayedTile');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('it should set playedTile list and increment interaction count correctly', async () => {
    // Initial count should be 0
    expect(await getInteractionCount(gameId)).toBe(0);
    expect(await getCurrentPlayedTile(gameId)).toStrictEqual([]);

    await setPlayedTileInteraction(gameId, FAKE_CONNECTION_ID1, TEST_TILES_CONSECUTIVE, MeldEnum.CONSECUTIVE, false);
    const expectedPlayedTile: PlayedTile = {
      playedTiles: TEST_TILES_CONSECUTIVE,
      connectionId: FAKE_CONNECTION_ID1,
      meldType: MeldEnum.CONSECUTIVE,
      skipInteraction: false,
    };

    // Test function call
    expect(getInteractionCountSpy).toHaveBeenCalledTimes(1);
    expect(getCurrentPlayedTileSpy).toHaveBeenCalledTimes(1);
    expect(setPlayedTileInteractionSpy).toHaveBeenCalledTimes(1);

    // Test response
    expect(await getInteractionCount(gameId)).toBe(1);
    expect(await getCurrentPlayedTile(gameId)).toIncludeSameMembers([expectedPlayedTile]);
  });

  test('it should set playedTile list and count concurrently', async () => {
    // Initial count should be 0
    expect(await getInteractionCount(gameId)).toBe(0);
    expect(await getCurrentPlayedTile(gameId)).toStrictEqual([]);

    await Promise.all(
      CONNECTION_IDS.map((connectionId) => {
        return setPlayedTileInteraction(gameId, connectionId, TEST_TILES_CONSECUTIVE, MeldEnum.CONSECUTIVE);
      }),
    );
    const expectedPlayedTile: PlayedTile = {
      playedTiles: TEST_TILES_CONSECUTIVE,
      connectionId: FAKE_CONNECTION_ID1,
      meldType: MeldEnum.CONSECUTIVE,
      skipInteraction: false,
    };
    const expectedPlayedTileList: PlayedTile[] = [
      expectedPlayedTile,
      { ...expectedPlayedTile, connectionId: FAKE_CONNECTION_ID2 },
      { ...expectedPlayedTile, connectionId: FAKE_CONNECTION_ID3 },
      { ...expectedPlayedTile, connectionId: FAKE_CONNECTION_ID4 },
    ];

    // Test function call
    expect(getInteractionCountSpy).toHaveBeenCalledTimes(1);
    expect(getCurrentPlayedTileSpy).toHaveBeenCalledTimes(1);
    expect(setPlayedTileInteractionSpy).toHaveBeenCalledTimes(4);

    // Test response
    expect(await getInteractionCount(gameId)).toBe(4);
    expect(await getCurrentPlayedTile(gameId)).toIncludeSameMembers(expectedPlayedTileList);
  });

  test('it should throw error when interaction count exceeds 4', async () => {
    // Initial count should be 0
    expect(await getInteractionCount(gameId)).toBe(0);
    expect(await getCurrentPlayedTile(gameId)).toStrictEqual([]);

    await setPlayedTileInteraction(gameId, FAKE_CONNECTION_ID1, TEST_TILES_CONSECUTIVE, MeldEnum.CONSECUTIVE, false);
    await setPlayedTileInteraction(gameId, FAKE_CONNECTION_ID1, TEST_TILES_CONSECUTIVE, MeldEnum.CONSECUTIVE, false);
    await setPlayedTileInteraction(gameId, FAKE_CONNECTION_ID1, TEST_TILES_CONSECUTIVE, MeldEnum.CONSECUTIVE, false);
    await setPlayedTileInteraction(gameId, FAKE_CONNECTION_ID1, TEST_TILES_CONSECUTIVE, MeldEnum.CONSECUTIVE, false);
    const func = setPlayedTileInteraction(
      gameId,
      FAKE_CONNECTION_ID1,
      TEST_TILES_CONSECUTIVE,
      MeldEnum.CONSECUTIVE,
      false,
    );
    const expectedPlayedTile: PlayedTile = {
      playedTiles: TEST_TILES_CONSECUTIVE,
      connectionId: FAKE_CONNECTION_ID1,
      meldType: MeldEnum.CONSECUTIVE,
      skipInteraction: false,
    };

    // Test function call
    expect(getInteractionCountSpy).toHaveBeenCalledTimes(1);
    expect(getCurrentPlayedTileSpy).toHaveBeenCalledTimes(1);
    expect(setPlayedTileInteractionSpy).toHaveBeenCalledTimes(5);

    // Test response
    await expect(func).rejects.toThrow(CONDITIONAL_FAILED_MSG);
    expect(await getInteractionCount(gameId)).toBe(4);
    expect(await getCurrentPlayedTile(gameId)).toIncludeSameMembers([
      expectedPlayedTile,
      expectedPlayedTile,
      expectedPlayedTile,
      expectedPlayedTile,
    ]);
  });
});

/* ----------------------------------------------------------------------------
 * Test resetPlayedTileInteraction
 * ------------------------------------------------------------------------- */
describe('test resetPlayedTileInteraction', () => {
  let gameState: GameState;
  let gameId: string;

  let setPlayedTileInteractionSpy: jest.SpyInstance;
  let getInteractionCountSpy: jest.SpyInstance;
  let getCurrentPlayedTileSpy: jest.SpyInstance;
  let resetPlayedTileInteractionSpy: jest.SpyInstance;

  beforeEach(async () => {
    gameState = await initGameState(FAKE_GAME_ID, CONNECTION_IDS);
    gameId = gameState.gameId;

    setPlayedTileInteractionSpy = jest.spyOn(gameStateDBFunctions, 'setPlayedTileInteraction');
    getInteractionCountSpy = jest.spyOn(gameStateDBFunctions, 'getInteractionCount');
    getCurrentPlayedTileSpy = jest.spyOn(gameStateDBFunctions, 'getCurrentPlayedTile');
    resetPlayedTileInteractionSpy = jest.spyOn(gameStateDBFunctions, 'resetPlayedTileInteraction');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('it should reset interaction count and playedTile list', async () => {
    // Initial count should be 0
    expect(await getInteractionCount(gameId)).toBe(0);
    expect(await getCurrentPlayedTile(gameId)).toStrictEqual([]);

    await setPlayedTileInteraction(gameId, FAKE_CONNECTION_ID1, TEST_TILES_CONSECUTIVE, MeldEnum.CONSECUTIVE);
    await setPlayedTileInteraction(gameId, FAKE_CONNECTION_ID2, TEST_TILES_TRIPLET, MeldEnum.TRIPLET);
    await setPlayedTileInteraction(gameId, FAKE_CONNECTION_ID3, TEST_TILES_CONSECUTIVE, MeldEnum.CONSECUTIVE);
    await resetPlayedTileInteraction(gameId);

    // Test function call
    expect(getInteractionCountSpy).toHaveBeenCalledTimes(1);
    expect(getCurrentPlayedTileSpy).toHaveBeenCalledTimes(1);
    expect(setPlayedTileInteractionSpy).toHaveBeenCalledTimes(3);
    expect(resetPlayedTileInteractionSpy).toHaveBeenCalledTimes(1);

    // Test response
    expect(await getInteractionCount(gameId)).toBe(0);
    expect(await getCurrentPlayedTile(gameId)).toIncludeSameMembers([]);
  });
});

/* ----------------------------------------------------------------------------
 * Test startNewGameRound
 * ------------------------------------------------------------------------- */
describe('test startNewGameRound', () => {
  let gameState: GameState;
  let gameId: string;
  let prevHand: UserHand[];
  let prevWall: string[];

  beforeEach(async () => {
    gameState = await initGameState(FAKE_GAME_ID, CONNECTION_IDS);
    gameId = gameState.gameId;
    prevHand = gameState.hands;
    prevWall = gameState.wall;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('it should change wall & hands and reset currentTurn', async () => {
    const updatedGameState = await gameStateDBFunctions.startNewGameRound(gameId, CONNECTION_IDS);

    expect(updatedGameState.currentTurn).toStrictEqual(0);
    expect(updatedGameState.hands).not.toStrictEqual(prevHand);
    expect(updatedGameState.wall).not.toStrictEqual(prevWall);
  });
});
