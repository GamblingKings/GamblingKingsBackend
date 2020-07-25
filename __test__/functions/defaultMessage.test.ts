import * as LambdaTester from 'lambda-tester';
import { handler } from '../../src/functions/defaultMessage';
import { response } from '../../src/utils/responseHelper';
import { createEvent } from './functionsTestHelpers';
import { LambdaResponse } from '../../src/types/response';

const DEFAULT_MESSAGE = 'Default message';

describe('test defaultMessage', () => {
  test('it should return 200 as response', async () => {
    // Mock lambda event
    const responseJSON = { action: '', payload: { message: ' ' } };
    const event = createEvent({ eventBodyJSON: responseJSON });

    const expectedResponse = response(200, DEFAULT_MESSAGE);
    await LambdaTester(handler)
      .event({ requestContext: event, body: 'hello' })
      .expectResult((result: LambdaResponse) => {
        expect(result).toStrictEqual(expectedResponse);
      });
  });
});
