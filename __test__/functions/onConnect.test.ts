import * as LambdaTester from 'lambda-tester';
import { handler } from '../../src/functions/onConnect';
import * as userFunctions from '../../src/dynamodb/userDBService';
import { response } from '../../src/utils/responseHelper';
import { createEvent } from './functionsTestHelpers';
import { LambdaResponse } from '../../src/types/response';

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

  test('it should save a connection successfully', async () => {
    const expectedResponse = response(200, 'Connection added successfully');
    saveConnectionSpy.mockReturnValue(expectedResponse);

    await LambdaTester(handler)
      .event(event)
      .expectResult((result: LambdaResponse) => {
        expect(result).toStrictEqual(expectedResponse);
      });

    expect(saveConnectionSpy).toHaveBeenCalledTimes(1);
    expect(saveConnectionSpy).toHaveBeenCalledWith(TEST_CONNECTION_ID);
  });

  test('it should fail to save a connection', async () => {
    const errorMsg = 'saveConnection db call failed';
    const expectedResponse = response(500, errorMsg);
    saveConnectionSpy.mockRejectedValue(errorMsg);

    await LambdaTester(handler)
      .event(event)
      .expectResult((result: LambdaResponse) => {
        expect(result).toStrictEqual(expectedResponse);
      });

    expect(saveConnectionSpy).toHaveBeenCalledTimes(1);
    expect(saveConnectionSpy).toHaveBeenCalledWith(TEST_CONNECTION_ID);
  });
});
