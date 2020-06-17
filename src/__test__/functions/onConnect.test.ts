import * as LambdaTester from 'lambda-tester';
import { handler } from '../../functions/onConnect';
import * as userFunctions from '../../module/userDBService';
import { response } from '../../utils/response';
import { createEvent } from './functionsTestConstants';
import { LambdaResponse } from '../../types';

const TEST_CONNECTION_ID = 'test-onConnect-connectionId';

describe('test onConnect', () => {
  const mockResponseJSON = { action: '', payload: { message: ' ' } };
  const event = createEvent({
    connectionId: TEST_CONNECTION_ID,
    eventBodyJSON: mockResponseJSON,
  });
  let saveConnectionSpy: jest.SpyInstance;

  beforeEach(async () => {
    saveConnectionSpy = jest.spyOn(userFunctions, 'saveConnection');
  });

  afterEach(() => {
    saveConnectionSpy.mockRestore();
  });

  test('it should save a connection', async () => {
    const expectedResponse = response(200, 'Connection added successfully');
    saveConnectionSpy.mockReturnValue(expectedResponse);
    await LambdaTester(handler)
      .event(event)
      .expectResult((result: LambdaResponse) => {
        expect(result).toStrictEqual(expectedResponse);
      });

    expect(saveConnectionSpy).toHaveBeenCalledTimes(1);
  });

  test('it should fail to save a connection', async () => {
    const errorMsg = 'saveConnection db call failed';
    saveConnectionSpy.mockRejectedValue(errorMsg);
    const expectedResponse = response(500, errorMsg);
    await LambdaTester(handler)
      .event(event)
      .expectResult((result: LambdaResponse) => {
        expect(result).toStrictEqual(expectedResponse);
      });

    expect(saveConnectionSpy).toHaveBeenCalledTimes(1);
  });
});
