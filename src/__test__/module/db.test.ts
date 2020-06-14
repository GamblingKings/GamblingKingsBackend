/* eslint-disable @typescript-eslint/ban-types */
import {
  createGame,
  deleteConnection,
  getAllConnections,
  getGameByGameId,
  getUserByConnectionId,
  saveConnection,
  setUsername,
} from '../../module/db';

import { ddb } from '../jestLocalDynamoDB';
import { cleanupTestUser, cleanupTestGame } from './dbHelpers';

/* ----------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------- */
// User
const FAKE_CONNECTION_ID1 = 'fake-connection-id-1';
const FAKE_CONNECTION_ID2 = 'fake-connection-id-2';
const FAKE_USERNAME1 = 'fake-username-1';
const TEST_USER_OBJECT1 = { connectionId: FAKE_CONNECTION_ID1 };
const TEST_USER_OBJECT2 = { connectionId: FAKE_CONNECTION_ID2 };

// Game
const FAKE_GAME_NAME1 = 'fake-game-name1';
const FAKE_GAME_NAME2 = 'fake-game-name2';
const FAKE_GAME_TYPE1 = 'fake-game-type1';
const FAKE_GAME_TYPE2 = 'fake-game-type2';
const FAKE_GAME_VERSION1 = 'fake-game-version1';
const FAKE_GAME_VERSION2 = 'fake-game-version2';
const TEST_GAME_OBJECT1 = {
  users: [TEST_USER_OBJECT1],
  gameName: FAKE_GAME_NAME1,
  gameType: FAKE_GAME_TYPE1,
  gameVersion: FAKE_GAME_VERSION1,
};
const TEST_GAME_OBJECT2 = {
  users: [TEST_USER_OBJECT2],
  gameName: FAKE_GAME_NAME2,
  gameType: FAKE_GAME_TYPE2,
  gameVersion: FAKE_GAME_VERSION2,
};

/* ----------------------------------------------------------------------------
 * Setup and Teardown
 * ------------------------------------------------------------------------- */
beforeEach(async () => {
  await cleanupTestUser(FAKE_CONNECTION_ID1);
  await cleanupTestUser(FAKE_CONNECTION_ID2);
});

afterEach(async () => {
  await cleanupTestUser(FAKE_CONNECTION_ID1);
  await cleanupTestUser(FAKE_CONNECTION_ID2);
});

/* ----------------------------------------------------------------------------
 * Test saveConnection
 * ------------------------------------------------------------------------- */
describe('test saveConnection', () => {
  test('it should save user with connectionId to db', async () => {
    // Test response
    const response = await saveConnection(FAKE_CONNECTION_ID1, ddb);
    expect(response).toStrictEqual(TEST_USER_OBJECT1);

    // Check if newly created user is in the table
    expect(await getUserByConnectionId(FAKE_CONNECTION_ID1, ddb)).toStrictEqual(TEST_USER_OBJECT1);
  });

  test('it should throw ValidationException error if connectionId is empty', async () => {
    // Test error
    const func = () => saveConnection('', ddb);
    const errorMsg =
      'One or more parameter values are not valid. The AttributeValue for ' +
      'a key attribute cannot contain an empty string value. Key: connectionId';
    await expect(func).rejects.toThrow(errorMsg);
  });
});

/* ----------------------------------------------------------------------------
 * Test getConnectionById
 * ------------------------------------------------------------------------- */
describe('test getConnectionById', () => {
  test('it should get user by connectionId', async () => {
    // Create a test user
    expect(await saveConnection(FAKE_CONNECTION_ID1, ddb)).toStrictEqual(TEST_USER_OBJECT1);

    // Test get user by connection id
    const response = await getUserByConnectionId(FAKE_CONNECTION_ID1, ddb);
    expect(response).toStrictEqual(TEST_USER_OBJECT1);
  });

  test('it should return undefined if the connectionId does not exist', async () => {
    // Test get user by connection id
    const response = await getUserByConnectionId(FAKE_CONNECTION_ID1, ddb);
    expect(response).toBeUndefined();
  });
});

/* ----------------------------------------------------------------------------
 * Test deleteConnection
 * ------------------------------------------------------------------------- */
describe('test deleteConnection', () => {
  test('it should delete user', async () => {
    // Create a test user
    await saveConnection(FAKE_CONNECTION_ID1, ddb);
    expect(await getUserByConnectionId(FAKE_CONNECTION_ID1, ddb)).toStrictEqual(TEST_USER_OBJECT1);

    // Test delete user
    const response = await deleteConnection(FAKE_CONNECTION_ID1, ddb);

    // Test response
    expect(response).toStrictEqual(TEST_USER_OBJECT1);

    // Check user is gone
    expect(await getUserByConnectionId(FAKE_CONNECTION_ID1, ddb)).toBeUndefined();
  });

  test('it should return undefined if user does not exist', async () => {
    // Make sure test user does not exist before testing deleteConnection
    expect(await getUserByConnectionId(FAKE_CONNECTION_ID1, ddb)).toBeUndefined();

    // Test delete non-existing user
    const response = await deleteConnection(FAKE_CONNECTION_ID1, ddb);
    expect(response).toBeUndefined();
  });
});

/* ----------------------------------------------------------------------------
 * Test getAllConnections
 * ------------------------------------------------------------------------- */
describe('test getAllConnections', () => {
  test('it should get all the connections', async () => {
    // Create test users
    await saveConnection(FAKE_CONNECTION_ID1, ddb);
    expect(await getUserByConnectionId(FAKE_CONNECTION_ID1, ddb)).toStrictEqual(TEST_USER_OBJECT1);
    await saveConnection(FAKE_CONNECTION_ID2, ddb);
    expect(await getUserByConnectionId(FAKE_CONNECTION_ID2, ddb)).toStrictEqual(TEST_USER_OBJECT2);

    // Test get all connections
    const response = await getAllConnections(ddb);
    expect(response).toHaveLength(2);
    expect(response).toStrictEqual([TEST_USER_OBJECT1, TEST_USER_OBJECT2]);
  });

  test('it should get an empty list if there is no connections', async () => {
    // Test get all connections
    const response = await getAllConnections(ddb);
    expect(response).toHaveLength(0);
    expect(response).toStrictEqual([]);
  });
});

/* ----------------------------------------------------------------------------
 * Test setUsername
 * ------------------------------------------------------------------------- */
describe('test setUsername', () => {
  test('it should set username', async () => {
    // Create a test user
    await saveConnection(FAKE_CONNECTION_ID1, ddb);
    expect(await getUserByConnectionId(FAKE_CONNECTION_ID1, ddb)).toStrictEqual(TEST_USER_OBJECT1);

    // Test set username
    const response = await setUsername(FAKE_CONNECTION_ID1, FAKE_USERNAME1, ddb);
    expect(response).toStrictEqual({ ...TEST_USER_OBJECT1, username: FAKE_USERNAME1 });
  });

  test('it should throw error if username is an empty string', async () => {
    // Create a test user
    await saveConnection(FAKE_CONNECTION_ID1, ddb);
    expect(await getUserByConnectionId(FAKE_CONNECTION_ID1, ddb)).toStrictEqual(TEST_USER_OBJECT1);

    // Test set username
    const errorMsg = 'The conditional request failed';
    const func = setUsername(FAKE_CONNECTION_ID1, '', ddb);
    await expect(() => func).rejects.toThrow(errorMsg);
  });
});

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

  afterEach(async () => {
    await cleanupTestUser(FAKE_CONNECTION_ID1);
    await cleanupTestGame(gameId);
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
describe('test getAllGames', async () => {
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
      ...TEST_GAME_OBJECT1,
      creatorConnectionId: FAKE_CONNECTION_ID1,
      documentClient: ddb,
    });
    gameId1 = game2.gameId;
  });

  afterEach(async () => {
    await cleanupTestUser(FAKE_CONNECTION_ID1);
    await cleanupTestGame(gameId1);
    await cleanupTestGame(gameId2);
  });

  // TODO: Add these tests
  test('it should get all games', async () => {});
  test('it should get an empty list if there is no game in db', async () => {});
});
