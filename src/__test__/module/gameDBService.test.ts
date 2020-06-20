import { v4 as uuid } from 'uuid';
import { getUserByConnectionId, saveConnection } from '../../module/userDBService';
import {
  addUserToGame,
  createGame,
  deleteGame,
  getAllGames,
  getGameByGameId,
  removeUserFromGame,
  startGame,
} from '../../module/gameDBService';
import { ddb } from '../jestLocalDynamoDB';
import { cleanupTestGame } from './dbTestHelpers';
import { Game } from '../../models/Game';
import * as userDBFunctions from '../../module/userDBService';
import * as gameDBFunctions from '../../module/gameDBService';
import { User } from '../../models/User';
import {
  CONDITIONAL_FAILED_MSG,
  FAKE_CONNECTION_ID1,
  FAKE_CONNECTION_ID2,
  FAKE_CONNECTION_ID3,
  FAKE_GAME_NAME1,
  FAKE_GAME_TYPE1,
  FAKE_GAME_VERSION1,
  TEST_GAME_OBJECT1,
  TEST_GAME_OBJECT2,
  TEST_USER_OBJECT1,
  TEST_USER_OBJECT2,
  TEST_USER_OBJECT3,
} from '../testConstants';

/* ----------------------------------------------------------------------------
 * Test createGame
 * ------------------------------------------------------------------------- */
describe('test createGame', () => {
  test('create a game and save the game to db', async () => {
    // Create a test user
    await saveConnection(FAKE_CONNECTION_ID1, ddb);
    expect(await getUserByConnectionId(FAKE_CONNECTION_ID1, ddb)).toStrictEqual(TEST_USER_OBJECT1);

    // Test create a game
    const response = await createGame({ creatorConnectionId: FAKE_CONNECTION_ID1, documentClient: ddb });
    console.log('createGame response:', response);
    const { users, gameName, gameType, gameVersion } = response;
    expect(users).toStrictEqual([TEST_USER_OBJECT1]);
    expect(gameName).toBe('');
    expect(gameType).toBe('');
    expect(gameVersion).toBe('');
  });

  test('create a game with all attributes and save the game to db', async () => {
    // Create a test user
    await saveConnection(FAKE_CONNECTION_ID1, ddb);
    expect(await getUserByConnectionId(FAKE_CONNECTION_ID1, ddb)).toStrictEqual(TEST_USER_OBJECT1);

    // Test create a game
    const response = await createGame({
      ...TEST_GAME_OBJECT1,
      creatorConnectionId: FAKE_CONNECTION_ID1,
      documentClient: ddb,
    });
    console.log('createGame response:', response);
    const { users, gameName, gameType, gameVersion } = response;
    expect(users).toStrictEqual([TEST_USER_OBJECT1]);
    expect(gameName).toBe(FAKE_GAME_NAME1);
    expect(gameType).toBe(FAKE_GAME_TYPE1);
    expect(gameVersion).toBe(FAKE_GAME_VERSION1);
  });

  // TODO: Test Errors for createGame
});

/* ----------------------------------------------------------------------------
 * Test getGameByGameId
 * ------------------------------------------------------------------------- */
describe('test getGameByGameId', () => {
  let gameId: string;

  beforeEach(async () => {
    // Create a test user
    await saveConnection(FAKE_CONNECTION_ID1, ddb);

    // Create a game
    const game = await createGame({
      ...TEST_GAME_OBJECT1,
      creatorConnectionId: FAKE_CONNECTION_ID1,
      documentClient: ddb,
    });
    gameId = game.gameId;
  });

  test('it should get a game by gameId', async () => {
    const response = await getGameByGameId(gameId, ddb);
    expect(response).toStrictEqual({ ...TEST_GAME_OBJECT1, users: [TEST_USER_OBJECT1], gameId });
  });

  test('it should get undefined if the game does not exist', async () => {
    const response = await getGameByGameId('NON-EXISTING-GAME-ID', ddb);
    expect(response).toBeUndefined();
  });
});

/* ----------------------------------------------------------------------------
 * Test getAllGames
 * ------------------------------------------------------------------------- */
describe('test getAllGames', () => {
  let gameId1: string;
  let gameId2: string;

  beforeEach(async () => {
    // Create a test user
    await saveConnection(FAKE_CONNECTION_ID1, ddb);

    // Create games
    const game1 = await createGame({
      ...TEST_GAME_OBJECT1,
      creatorConnectionId: FAKE_CONNECTION_ID1,
      documentClient: ddb,
    });
    gameId1 = game1.gameId;

    const game2 = await createGame({
      ...TEST_GAME_OBJECT2,
      creatorConnectionId: FAKE_CONNECTION_ID1,
      documentClient: ddb,
    });
    gameId2 = game2.gameId;
  });

  test('it should get all games', async () => {
    const response = await getAllGames(ddb);
    const game1 = { ...TEST_GAME_OBJECT1, gameId: gameId1 };
    const game2 = { ...TEST_GAME_OBJECT2, gameId: gameId2 };
    game2.users = [TEST_USER_OBJECT1]; // game is created by the same user
    game2.host = TEST_USER_OBJECT1; // // game is created by the same user
    // Compare arrays but ignore array orders
    expect(response).toHaveLength(2);
    expect(response).toIncludeSameMembers([game1, game2]);
  });

  test('it should get an empty list if there is no game in db', async () => {
    await cleanupTestGame(gameId1);
    await cleanupTestGame(gameId2);

    const response = await getAllGames(ddb);
    expect(response).toHaveLength(0);
    expect(response).toIncludeSameMembers([]);
  });
});

/* ----------------------------------------------------------------------------
 * Test addUserToGame
 * ------------------------------------------------------------------------- */
describe('test addUserToGame', () => {
  let game: Game;
  let gameId: string;
  let getUserByConnectionIdSpy: jest.SpyInstance;
  let saveConnectionSpy: jest.SpyInstance;
  let getGameByGameIdSpy: jest.SpyInstance;
  let addUserToGameSpy: jest.SpyInstance;

  beforeEach(async () => {
    // Create a test user
    await saveConnection(FAKE_CONNECTION_ID1, ddb);

    // Create a game (user with FAKE_CONNECTION_ID1 should be in the game after the game is successfully created)
    game = await createGame({
      ...TEST_GAME_OBJECT1,
      creatorConnectionId: FAKE_CONNECTION_ID1,
      documentClient: ddb,
    });
    gameId = game.gameId;

    // Create spies (create after the setup above to avoid spying on the setup function calls)
    getUserByConnectionIdSpy = jest.spyOn(userDBFunctions, 'getUserByConnectionId');
    saveConnectionSpy = jest.spyOn(userDBFunctions, 'saveConnection');
    getGameByGameIdSpy = jest.spyOn(gameDBFunctions, 'getGameByGameId');
    addUserToGameSpy = jest.spyOn(gameDBFunctions, 'addUserToGame');
  });

  afterEach(() => {
    getUserByConnectionIdSpy.mockRestore();
    saveConnectionSpy.mockRestore();
    getGameByGameIdSpy.mockRestore();
    addUserToGameSpy.mockRestore();
  });

  test('it should add one user to a game', async () => {
    // Create a new test user
    await saveConnection(FAKE_CONNECTION_ID2, ddb);

    // Test add one user to the game
    const res = (await addUserToGame(gameId, FAKE_CONNECTION_ID2, ddb)) as Game;
    const actualUsersInGame = res.users;
    const expectedUsersInGame = [TEST_USER_OBJECT1, TEST_USER_OBJECT2];

    // Test function calls
    expect(saveConnectionSpy).toHaveBeenLastCalledWith(FAKE_CONNECTION_ID2, ddb);
    expect(getUserByConnectionIdSpy).toHaveBeenLastCalledWith(FAKE_CONNECTION_ID2, ddb);
    expect(getGameByGameIdSpy).toHaveBeenLastCalledWith(gameId, ddb);
    expect(addUserToGameSpy).toHaveBeenLastCalledWith(gameId, FAKE_CONNECTION_ID2, ddb);
    expect(saveConnectionSpy).toHaveBeenCalledTimes(1);
    expect(getUserByConnectionIdSpy).toHaveBeenCalledTimes(1);
    expect(getGameByGameIdSpy).toHaveBeenCalledTimes(1);
    expect(addUserToGameSpy).toHaveBeenCalledTimes(1);

    // Test response
    expect(actualUsersInGame).toHaveLength(2);
    expect(actualUsersInGame).toIncludeSameMembers(expectedUsersInGame);
    expect(((await getGameByGameId(gameId, ddb)) as Game).users).toIncludeSameMembers(expectedUsersInGame);
  });

  test('it should not allow to add the same user to a game', async () => {
    const func = addUserToGame(gameId, FAKE_CONNECTION_ID1, ddb);
    const errorMsg = 'addUserToGame: user is already in the game';
    await expect(func).rejects.toThrow(errorMsg);

    // Test function calls
    expect(getUserByConnectionIdSpy).toHaveBeenCalledTimes(1);
    expect(getGameByGameIdSpy).toHaveBeenCalledTimes(1);
    expect(addUserToGameSpy).toHaveBeenCalledTimes(1);
  });

  test('it should add more than one user to a game', async () => {
    // Create a new test user
    await saveConnection(FAKE_CONNECTION_ID2, ddb);
    await saveConnection(FAKE_CONNECTION_ID3, ddb);

    // Test add two users to the game
    await addUserToGame(gameId, FAKE_CONNECTION_ID2, ddb);
    const res = (await addUserToGame(gameId, FAKE_CONNECTION_ID3, ddb)) as Game;
    const actualUsersInGame = res.users;
    const expectedUsersInGame = [TEST_USER_OBJECT1, TEST_USER_OBJECT2, TEST_USER_OBJECT3];

    // Test function calls
    expect(saveConnectionSpy).toHaveBeenCalledTimes(2);
    expect(getUserByConnectionIdSpy).toHaveBeenCalledTimes(2);
    expect(getGameByGameIdSpy).toHaveBeenCalledTimes(2);
    expect(addUserToGameSpy).toHaveBeenCalledTimes(2);

    // Test response
    expect(actualUsersInGame).toHaveLength(3);
    expect(actualUsersInGame).toIncludeSameMembers(expectedUsersInGame);
    expect(((await getGameByGameId(gameId, ddb)) as Game).users).toIncludeSameMembers(expectedUsersInGame);
  });

  // TODO: Test Errors for addUserToGame
});

/* ----------------------------------------------------------------------------
 * Test removeUserFromGame
 * ------------------------------------------------------------------------- */
describe('test removeUserFromGame', () => {
  let game: Game;
  let gameId: string;
  let getGameByGameIdnIdSpy: jest.SpyInstance;
  let removeUserFromGameSpy: jest.SpyInstance;

  beforeEach(async () => {
    // Create a test user
    await saveConnection(FAKE_CONNECTION_ID1, ddb);

    // Create a game (user with FAKE_CONNECTION_ID1 should be in the game after the game is successfully created)
    game = await createGame({
      ...TEST_GAME_OBJECT1,
      creatorConnectionId: FAKE_CONNECTION_ID1,
      documentClient: ddb,
    });
    gameId = game.gameId;

    // Create spies (create after the setup above to avoid spying on the setup function calls)
    getGameByGameIdnIdSpy = jest.spyOn(gameDBFunctions, 'getGameByGameId');
    removeUserFromGameSpy = jest.spyOn(gameDBFunctions, 'removeUserFromGame');
  });

  afterEach(() => {
    getGameByGameIdnIdSpy.mockRestore();
    removeUserFromGameSpy.mockRestore();
  });

  test('it should remove user from a game', async () => {
    const response = await removeUserFromGame(gameId, FAKE_CONNECTION_ID1, ddb);
    const actualUsersList = response?.users;
    const expectedUsersList: User[] = [];

    // Test function calls
    expect(getGameByGameIdnIdSpy).toHaveBeenCalledTimes(1);
    expect(removeUserFromGameSpy).toHaveBeenCalledTimes(1);

    // Test response
    expect(actualUsersList).toHaveLength(0);
    expect(actualUsersList).toIncludeSameMembers(expectedUsersList);
    expect(((await getGameByGameId(gameId, ddb)) as Game).users).toIncludeSameMembers(expectedUsersList);
  });

  test('it should return undefined if users list is empty', async () => {
    // Call remove user from game twice
    await removeUserFromGame(gameId, FAKE_CONNECTION_ID1, ddb);
    const response = await removeUserFromGame(gameId, FAKE_CONNECTION_ID1, ddb);

    // Test function calls
    expect(getGameByGameIdnIdSpy).toHaveBeenCalledTimes(2);
    expect(removeUserFromGameSpy).toHaveBeenCalledTimes(2);

    // Test response
    expect(response).toBeUndefined();
    expect(((await getGameByGameId(gameId, ddb)) as Game).users).toIncludeSameMembers([]);
  });

  test('it should remove different users from the game', async () => {
    // Create two more users and join the game
    await saveConnection(FAKE_CONNECTION_ID2, ddb);
    await saveConnection(FAKE_CONNECTION_ID3, ddb);
    await addUserToGame(gameId, FAKE_CONNECTION_ID2, ddb);
    await addUserToGame(gameId, FAKE_CONNECTION_ID3, ddb);

    // Remove test user 1 and 3
    await removeUserFromGame(gameId, FAKE_CONNECTION_ID1, ddb);
    const response = await removeUserFromGame(gameId, FAKE_CONNECTION_ID3, ddb);
    const actualUsersList = response?.users;
    const expectedUsersList = [TEST_USER_OBJECT2];

    // Test function calls
    expect(getGameByGameIdnIdSpy).toHaveBeenCalledTimes(4);
    expect(removeUserFromGameSpy).toHaveBeenCalledTimes(2);

    // Test response
    expect(actualUsersList).toHaveLength(1);
    expect(actualUsersList).toIncludeSameMembers(expectedUsersList);
    expect(((await getGameByGameId(gameId, ddb)) as Game).users).toIncludeSameMembers(expectedUsersList);
  });

  // TODO: Test Errors for removeUserFromGame
});

/* ----------------------------------------------------------------------------
 * Test deleteGame
 * ------------------------------------------------------------------------- */
describe('test deleteGame', () => {
  let game: Game;
  let gameId: string;
  let deleteGameSpy: jest.SpyInstance;

  beforeEach(async () => {
    // Create a test user
    await saveConnection(FAKE_CONNECTION_ID1, ddb);

    // Create a game (user with FAKE_CONNECTION_ID1 should be in the game after the game is successfully created)
    game = await createGame({
      ...TEST_GAME_OBJECT1,
      creatorConnectionId: FAKE_CONNECTION_ID1,
      documentClient: ddb,
    });
    gameId = game.gameId;

    // Create spies (create after the setup above to avoid spying on the setup function calls)
    deleteGameSpy = jest.spyOn(gameDBFunctions, 'deleteGame');
  });

  afterEach(() => {
    deleteGameSpy.mockRestore();
  });

  test('it should delete a game successfully', async () => {
    const response = await deleteGame(gameId, ddb);

    // Test function call
    expect(deleteGameSpy).toHaveBeenCalledWith(gameId, ddb);
    expect(deleteGameSpy).toHaveBeenCalledTimes(1);

    // Test response
    expect(response).toStrictEqual(game);
    expect(await getGameByGameId(gameId, ddb)).toBeUndefined();
  });

  test('it should return undefined if a game is already deleted', async () => {
    // Delete the same game twice
    await deleteGame(gameId, ddb);
    const response = await deleteGame(gameId, ddb);

    // Test function call
    expect(deleteGameSpy).toHaveBeenLastCalledWith(gameId, ddb);
    expect(deleteGameSpy).toHaveBeenCalledTimes(2);

    // Test response
    expect(response).toBeUndefined();
    expect(await getGameByGameId(gameId, ddb)).toBeUndefined();
  });

  test('it should return undefined if a game does not exist', async () => {
    const randomGameId = uuid();

    // Try to delete a random game that does not exist
    const response = await deleteGame(randomGameId, ddb);

    // Test function call
    expect(deleteGameSpy).toHaveBeenLastCalledWith(randomGameId, ddb);
    expect(deleteGameSpy).toHaveBeenCalledTimes(1);

    // Test response
    expect(response).toBeUndefined();
    expect(await getGameByGameId(randomGameId, ddb)).toBeUndefined();
  });
});

/* ----------------------------------------------------------------------------
 * Test startGame
 * ------------------------------------------------------------------------- */
describe('test startGame', () => {
  let game: Game;
  let gameId: string;

  beforeEach(async () => {
    // Create a test user
    await saveConnection(FAKE_CONNECTION_ID1, ddb);

    // Create a game (user with FAKE_CONNECTION_ID1 should be in the game after the game is successfully created)
    game = await createGame({
      ...TEST_GAME_OBJECT1,
      creatorConnectionId: FAKE_CONNECTION_ID1,
      documentClient: ddb,
    });
    gameId = game.gameId;
  });

  test('it should set the started game flag on the game to true', async () => {
    const response = (await startGame(gameId, FAKE_CONNECTION_ID1, ddb)) as Game;
    expect(response.started).toBeTruthy();
    expect(((await getGameByGameId(gameId, ddb)) as Game).started).toBeTruthy();
  });

  test('it should throw error if the game does not exist', async () => {
    const func = startGame('NON-EXISTING-GAME-ID', FAKE_CONNECTION_ID1, ddb);
    await expect(func).rejects.toThrow(CONDITIONAL_FAILED_MSG);
  });

  test('It should throw error if the started flag is already set to true', async () => {
    await startGame(gameId, FAKE_CONNECTION_ID1, ddb);
    const func = startGame(gameId, FAKE_CONNECTION_ID1, ddb);
    await expect(func).rejects.toThrow(CONDITIONAL_FAILED_MSG);
  });

  test('It should throw error if the user who requests to start a game is not host', async () => {
    // Create another user
    await saveConnection(FAKE_CONNECTION_ID2, ddb);

    // Add the user to the game
    await addUserToGame(gameId, FAKE_CONNECTION_ID2, ddb);

    const func = startGame(gameId, FAKE_CONNECTION_ID2, ddb);
    await expect(func).rejects.toThrow(CONDITIONAL_FAILED_MSG);
  });
});
