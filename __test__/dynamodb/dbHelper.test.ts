import { removeDynamoDocumentVersion } from '../../src/dynamodb/dbHelper';
import { TEST_GAME_OBJECT1 } from '../testConstants';

describe('test removeGameDocumentVersion', () => {
  test('it should remove document version', () => {
    const obj = {
      ...TEST_GAME_OBJECT1,
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { version, ...expectedResponse } = obj; // remove version property from obj

    const response = removeDynamoDocumentVersion(TEST_GAME_OBJECT1);
    expect(response.version).toBeUndefined();
    expect(response).toStrictEqual(expectedResponse);
  });
});
