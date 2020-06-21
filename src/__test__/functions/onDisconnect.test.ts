import * as LambdaTester from 'lambda-tester';
import { handler } from '../../functions/onDisconnect';
import * as userFunctions from '../../module/userDBService';
import { response } from '../../utils/responseHelper';
import { createEvent } from './functionsTestHelpers';
import { LambdaResponse } from '../../types/response';
import { FAKE_CONNECTION_ID1, FAKE_CONNECTION_ID2 } from '../testConstants';

const TEST_CONNECTION_ID = 'test-onDisconnect-connectionId';

describe('test onDisconnect', () => {
  const mockResponseJSON = { action: '', payload: { message: ' ' } };
  const event = createEvent({
    connectionId: TEST_CONNECTION_ID,
    eventBodyJSON: mockResponseJSON,
  });
  let deleteConnectionSpy: jest.SpyInstance;

  beforeEach(async () => {
    deleteConnectionSpy = jest.spyOn(userFunctions, 'deleteConnection');
  });

  afterEach(() => {
    deleteConnectionSpy.mockRestore();
  });

  test('it should delete a connection successfully', async () => {
    const getAllConnectionsSpy: jest.SpyInstance = jest.spyOn(userFunctions, 'getAllConnections');

    deleteConnectionSpy.mockReturnValue(FAKE_CONNECTION_ID1);
    getAllConnectionsSpy.mockReturnValue([FAKE_CONNECTION_ID2]);

    const expectedResponse = response(200, 'Connection deleted successfully');

    await LambdaTester(handler)
      .event(event)
      .expectResult((result: LambdaResponse) => {
        expect(result).toStrictEqual(expectedResponse);
      });

    expect(deleteConnectionSpy).toHaveBeenCalledTimes(1);
    expect(getAllConnectionsSpy).toHaveBeenCalledTimes(1);
    expect(deleteConnectionSpy).toHaveBeenCalledWith(TEST_CONNECTION_ID);

    getAllConnectionsSpy.mockRestore();
  });

  test('it should fail to delete a connection', async () => {
    const errorMsg = 'deleteConnection db call failed';
    const expectedResponse = response(500, errorMsg);
    deleteConnectionSpy.mockRejectedValue(errorMsg);

    await LambdaTester(handler)
      .event(event)
      .expectResult((result: LambdaResponse) => {
        expect(result).toStrictEqual(expectedResponse);
      });

    expect(deleteConnectionSpy).toHaveBeenCalledTimes(1);
    expect(deleteConnectionSpy).toHaveBeenCalledWith(TEST_CONNECTION_ID);
  });
});
