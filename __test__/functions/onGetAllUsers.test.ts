import * as LambdaTester from 'lambda-tester';
import { handler } from '../../src/functions/onGetAllUsers';
import * as broadcastFunctions from '../../src/websocket/broadcast/userBroadcast';
import { createEvent } from './functionsTestHelpers';
import { TEST_USER_OBJECT1, TEST_USER_OBJECT2 } from '../testConstants';
import { response } from '../../src/utils/responseHelper';
import { LambdaResponse } from '../../src/types/response';

const TEST_CONNECTION_ID = 'test-onGetAllUsers-connection-id';
const TEST_USERS = [TEST_USER_OBJECT1, TEST_USER_OBJECT2];

describe('test onGetAllUsers', () => {
  // Mock event
  const mockResponseJSON = { action: '', payload: { users: TEST_USERS } };
  const event = createEvent({
    connectionId: TEST_CONNECTION_ID,
    eventBodyJSON: mockResponseJSON,
  });

  // Spies
  let broadcastConnectionsSpy: jest.SpyInstance;
  let broadcastUserUpdateSpy: jest.SpyInstance;

  beforeEach(() => {
    broadcastConnectionsSpy = jest.spyOn(broadcastFunctions, 'broadcastConnections');
    broadcastUserUpdateSpy = jest.spyOn(broadcastFunctions, 'broadcastUserUpdate');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('should get all users', async () => {
    const expectedResponse = response(200, JSON.stringify(TEST_USERS));
    broadcastConnectionsSpy.mockReturnValue(TEST_USERS);
    broadcastUserUpdateSpy.mockReturnValue(TEST_USERS);
    // getAllConnectionsSpy.mockReturnValue(TEST_USERS);

    await LambdaTester(handler)
      .event(event)
      .expectResult((result: LambdaResponse) => {
        expect(result).toStrictEqual(expectedResponse);
      });

    expect(broadcastConnectionsSpy).toHaveBeenCalledTimes(1);
    expect(broadcastUserUpdateSpy).toHaveBeenCalledTimes(1);
  });
});
