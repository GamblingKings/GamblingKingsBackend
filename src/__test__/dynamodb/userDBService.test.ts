/* ----------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------- */
import {
  deleteConnection,
  getAllConnections,
  getUserByConnectionId,
  removeGameIdFromUser,
  saveConnection,
  setGameIdForUser,
  setUsername,
} from '../../dynamodb/userDBService';
import {
  CONDITIONAL_FAILED_MSG,
  FAKE_CONNECTION_ID1,
  FAKE_CONNECTION_ID2,
  FAKE_USERNAME1,
  TEST_GAME_OBJECT1,
  TEST_USER_OBJECT1,
  TEST_USER_OBJECT2,
} from '../testConstants';
import { createGame } from '../../dynamodb/gameDBService';
import { Game } from '../../models/Game';
import { User } from '../../models/User';

/* ----------------------------------------------------------------------------
 * Test saveConnection
 * ------------------------------------------------------------------------- */
describe('test saveConnection', () => {
  test('it should save user with connectionId to db', async () => {
    // Test response
    const response = await saveConnection(FAKE_CONNECTION_ID1);
    expect(response).toStrictEqual(TEST_USER_OBJECT1);

    // Check if newly created user is in the table
    expect(await getUserByConnectionId(FAKE_CONNECTION_ID1)).toStrictEqual(TEST_USER_OBJECT1);
  });

  test('it should throw ValidationException error if connectionId is empty', async () => {
    // Test error
    const func = () => saveConnection('');
    const errorMsg =
      'One or more parameter values are not valid. The AttributeValue for ' +
      'a key attribute cannot contain an empty string value. Key: connectionId';
    await expect(func).rejects.toThrow(errorMsg);
  });
});

/* ----------------------------------------------------------------------------
 * Test getUserByConnectionId
 * ------------------------------------------------------------------------- */
describe('test getConnectionById', () => {
  test('it should get user by connectionId', async () => {
    // Create a test user
    expect(await saveConnection(FAKE_CONNECTION_ID1)).toStrictEqual(TEST_USER_OBJECT1);

    // Test get user by connection id
    const response = await getUserByConnectionId(FAKE_CONNECTION_ID1);
    expect(response).toStrictEqual(TEST_USER_OBJECT1);
  });

  test('it should return undefined if the connectionId does not exist', async () => {
    // Test get user by connection id
    const response = await getUserByConnectionId(FAKE_CONNECTION_ID1);
    expect(response).toBeUndefined();
  });
});

/* ----------------------------------------------------------------------------
 * Test deleteConnection
 * ------------------------------------------------------------------------- */
describe('test deleteConnection', () => {
  test('it should delete user', async () => {
    // Create a test user
    await saveConnection(FAKE_CONNECTION_ID1);
    expect(await getUserByConnectionId(FAKE_CONNECTION_ID1)).toStrictEqual(TEST_USER_OBJECT1);

    // Test delete user
    const response = await deleteConnection(FAKE_CONNECTION_ID1);

    // Test response
    expect(response).toStrictEqual(TEST_USER_OBJECT1);

    // Check user is gone
    expect(await getUserByConnectionId(FAKE_CONNECTION_ID1)).toBeUndefined();
  });

  test('it should return undefined if user does not exist', async () => {
    // Make sure test user does not exist before testing deleteConnection
    expect(await getUserByConnectionId(FAKE_CONNECTION_ID1)).toBeUndefined();

    // Test delete non-existing user
    const response = await deleteConnection(FAKE_CONNECTION_ID1);
    expect(response).toBeUndefined();
  });
});

/* ----------------------------------------------------------------------------
 * Test getAllConnections
 * ------------------------------------------------------------------------- */
describe('test getAllConnections', () => {
  test('it should get all the connections', async () => {
    // Create test users
    await saveConnection(FAKE_CONNECTION_ID1);
    expect(await getUserByConnectionId(FAKE_CONNECTION_ID1)).toStrictEqual(TEST_USER_OBJECT1);
    await saveConnection(FAKE_CONNECTION_ID2);
    expect(await getUserByConnectionId(FAKE_CONNECTION_ID2)).toStrictEqual(TEST_USER_OBJECT2);

    // Test get all connections
    const response = await getAllConnections();
    expect(response).toHaveLength(2);
    expect(response).toIncludeSameMembers([TEST_USER_OBJECT1, TEST_USER_OBJECT2]);
  });

  test('it should get an empty list if there is no connections', async () => {
    // Test get all connections
    const response = await getAllConnections();
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
    await saveConnection(FAKE_CONNECTION_ID1);
    expect(await getUserByConnectionId(FAKE_CONNECTION_ID1)).toStrictEqual(TEST_USER_OBJECT1);

    // Test set username
    const response = await setUsername(FAKE_CONNECTION_ID1, FAKE_USERNAME1);
    expect(response).toStrictEqual({ ...TEST_USER_OBJECT1, username: FAKE_USERNAME1 });
  });

  test('it should throw error if username is an empty string', async () => {
    // Create a test user
    await saveConnection(FAKE_CONNECTION_ID1);
    expect(await getUserByConnectionId(FAKE_CONNECTION_ID1)).toStrictEqual(TEST_USER_OBJECT1);

    // Test set username
    const func = setUsername(FAKE_CONNECTION_ID1, '');
    await expect(() => func).rejects.toThrow(CONDITIONAL_FAILED_MSG);
  });
});

/* ----------------------------------------------------------------------------
 * Test setGameIdForUser
 * ------------------------------------------------------------------------- */
describe('test setGameIdForUser', () => {
  let game: Game;
  let gameId: string;

  beforeEach(async () => {
    // Create a test user
    await saveConnection(FAKE_CONNECTION_ID1);

    // Create a game (user with FAKE_CONNECTION_ID1 should be in the game after the game is successfully created)
    game = await createGame({
      ...TEST_GAME_OBJECT1,
      creatorConnectionId: FAKE_CONNECTION_ID1,
    });
    gameId = game.gameId;
  });

  test('it should set gameId for the user successfully', async () => {
    const response = await setGameIdForUser(FAKE_CONNECTION_ID1, gameId);
    const expectedResponse: User = {
      ...TEST_USER_OBJECT1,
      gameId,
    };

    expect(response).toStrictEqual(expectedResponse);
  });

  test('it should throw error if update with non-existing connection id', async () => {
    const func = setGameIdForUser('NON-EXISTING-ID', gameId);
    await expect(func).rejects.toThrow(CONDITIONAL_FAILED_MSG);
  });

  test('it should throw error gameId is already set in the user', async () => {
    await setGameIdForUser(FAKE_CONNECTION_ID1, gameId);
    const func = setGameIdForUser(FAKE_CONNECTION_ID1, gameId);
    await expect(func).rejects.toThrow(CONDITIONAL_FAILED_MSG);
  });
});

/* ----------------------------------------------------------------------------
 * Test removeGameIdFromUser
 * ------------------------------------------------------------------------- */
describe('test removeGameIdFromUser', () => {
  let game: Game;
  let gameId: string;

  beforeEach(async () => {
    // Create a test user
    await saveConnection(FAKE_CONNECTION_ID1);

    // Create a game (user with FAKE_CONNECTION_ID1 should be in the game after the game is successfully created)
    game = await createGame({
      ...TEST_GAME_OBJECT1,
      creatorConnectionId: FAKE_CONNECTION_ID1,
    });
    gameId = game.gameId;

    // Set game Id for the user
    await setGameIdForUser(FAKE_CONNECTION_ID1, gameId);
  });

  test('it should remove gameId from the user successfully', async () => {
    const response = await removeGameIdFromUser(FAKE_CONNECTION_ID1);
    expect(response).toStrictEqual(TEST_USER_OBJECT1);
  });

  test('it should throw error if remove gameId with non-existing connection id', async () => {
    const func = removeGameIdFromUser('NON-EXISTING-ID');
    await expect(func).rejects.toThrow(CONDITIONAL_FAILED_MSG);
  });

  test('it should throw error if gameId is not in the user', async () => {
    await removeGameIdFromUser(FAKE_CONNECTION_ID1);
    const func = removeGameIdFromUser(FAKE_CONNECTION_ID1);
    await expect(func).rejects.toThrow(CONDITIONAL_FAILED_MSG);
  });
});
