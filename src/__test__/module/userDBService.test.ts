/* ----------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------- */
// User
import {
  deleteConnection,
  getAllConnections,
  getUserByConnectionId,
  saveConnection,
  setUsername,
} from '../../module/userDBService';
import { ddb } from '../jestLocalDynamoDB';
import {
  FAKE_CONNECTION_ID1,
  FAKE_CONNECTION_ID2,
  FAKE_USERNAME1,
  TEST_USER_OBJECT1,
  TEST_USER_OBJECT2,
} from '../testConstants';

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
    expect(response).toIncludeSameMembers([TEST_USER_OBJECT1, TEST_USER_OBJECT2]);
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
