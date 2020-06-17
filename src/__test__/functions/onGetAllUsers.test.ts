import { getAllConnections } from '../../module/userDBService';
import * as userFunctions from '../../module/userDBService';
import { WebSocketClient } from '../../WebSocketClient';
import { createEvent } from './functionsTestHelpers';

const TEST_CONNECTION_ID = 'test-onGetAllUsers-connection-id';

describe('test onGetAllUsers', () => {
  const mockResponseJSON = { action: '', payload: { message: ' ' } };
  const event = createEvent({
    connectionId: TEST_CONNECTION_ID,
    eventBodyJSON: mockResponseJSON,
  });
  const webSocketClient: WebSocketClient = new WebSocketClient(event.requestContext);
  let webSocketClientSpy: jest.SpyInstance;
  let getAllConnectionsSpy: jest.SpyInstance;

  beforeEach(() => {
    getAllConnectionsSpy = jest.spyOn(userFunctions, 'getAllConnections');
    webSocketClientSpy = jest.spyOn(webSocketClient, 'send');
  });

  afterEach(() => {
    getAllConnectionsSpy.mockRestore();
    webSocketClientSpy.mockRestore();
  });

  test('placeholder', () => {
    expect(1).toBe(1);
  });
});
