import { getConnectionIdsExceptCaller, getConnectionIdsFromUsers, sleep } from '../../src/utils/broadcastHelper';
import {
  FAKE_CONNECTION_ID1,
  FAKE_CONNECTION_ID2,
  FAKE_CONNECTION_ID3,
  TEST_USER_OBJECT1,
  TEST_USER_OBJECT2,
  TEST_USER_OBJECT3,
} from '../testConstants';

const TEST_USERS = [TEST_USER_OBJECT3, TEST_USER_OBJECT2, TEST_USER_OBJECT1];

describe('test getConnectionIdsFromUsers', () => {
  test('it should get all connectionIds from a list of user objects', () => {
    const connectionIds = getConnectionIdsFromUsers(TEST_USERS);
    const expectedConnectionIds = [FAKE_CONNECTION_ID3, FAKE_CONNECTION_ID2, FAKE_CONNECTION_ID1];
    expect(connectionIds).toStrictEqual(expectedConnectionIds);
  });
});

describe('test getConnectionIdsExceptCaller', () => {
  test('it should get all connectionIds except caller from a list of user objects', () => {
    const connectionIds = getConnectionIdsExceptCaller(FAKE_CONNECTION_ID2, [
      FAKE_CONNECTION_ID1,
      FAKE_CONNECTION_ID2,
      FAKE_CONNECTION_ID3,
    ]);
    const expectedConnectionIds = [FAKE_CONNECTION_ID1, FAKE_CONNECTION_ID3];
    expect(connectionIds).toStrictEqual(expectedConnectionIds);
  });
});

describe('test sleep', () => {
  test('it should delay 5s', async () => {
    const sleepTime = 5000;
    const startTime = new Date().getTime();
    await sleep(sleepTime);
    const endTime = new Date().getTime();
    expect(endTime - startTime - sleepTime).toBeLessThan(50); // difference less than 1%
  });
});
