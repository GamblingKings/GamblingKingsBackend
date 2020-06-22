import { removeDynamoDocumentVersion } from '../../utils/dbHelper';
import { TEST_GAME_OBJECT1 } from '../testConstants';

describe('test removeGameDocumentVersion', () => {
  test('it should remove document version', () => {
    const expectedResponse = {
      ...TEST_GAME_OBJECT1,
    };
    delete expectedResponse.version;

    const response = removeDynamoDocumentVersion(TEST_GAME_OBJECT1);
    expect(response.version).toBeUndefined();
    expect(response).toStrictEqual(expectedResponse);
  });
});
