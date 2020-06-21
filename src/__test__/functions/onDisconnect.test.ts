import * as AWS from 'aws-sdk';
import * as AWSMock from 'aws-sdk-mock';
import { PostToConnectionRequest } from 'aws-sdk/clients/apigatewaymanagementapi';
import * as LambdaTester from 'lambda-tester';
import { handler } from '../../functions/onDisconnect';
import * as userFunctions from '../../module/userDBService';
import * as gamesFunctions from '../../module/gameDBService';
import { response } from '../../utils/responseHelper';
import { createEvent } from './functionsTestHelpers';
import { LambdaResponse } from '../../types/response';
import { FAKE_CONNECTION_ID1, FAKE_CONNECTION_ID2, TEST_GAME_OBJECT1 } from '../testConstants';
import { getUserByConnectionId, saveConnection, setGameIdForUser } from '../../module/userDBService';
import { addUserToGame, createGame, getGameByGameId, removeUserFromGame } from '../../module/gameDBService';
import { Game } from '../../models/Game';
import { getConnectionIdsFromUsers } from '../../functions/functionsHelper';

describe('test onDisconnect', () => {
  let game: Game;
  let gameId: string;

  const mockResponseJSON = { action: '', payload: { message: ' ' } };
  const event = createEvent({
    connectionId: FAKE_CONNECTION_ID1,
    eventBodyJSON: mockResponseJSON,
  });

  let deleteConnectionSpy: jest.SpyInstance;
  let getAllConnectionsSpy: jest.SpyInstance;
  let removeUserFromGameSpy: jest.SpyInstance;

  beforeEach(async () => {
    AWS.config.update({ region: 'localhost' });
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock(
      'ApiGatewayManagementApi',
      'postToConnection',
      // eslint-disable-next-line @typescript-eslint/ban-types
      (params: PostToConnectionRequest, callback: Function) => {
        callback(null, {});
      },
    );

    await saveConnection(FAKE_CONNECTION_ID1);
    game = await createGame({
      creatorConnectionId: FAKE_CONNECTION_ID1,
      gameName: TEST_GAME_OBJECT1.gameName,
      gameType: TEST_GAME_OBJECT1.gameType,
      gameVersion: TEST_GAME_OBJECT1.gameVersion,
    });
    gameId = game.gameId;
    await setGameIdForUser(FAKE_CONNECTION_ID1, gameId);
    console.log('User:', await getUserByConnectionId(FAKE_CONNECTION_ID1));

    deleteConnectionSpy = jest.spyOn(userFunctions, 'deleteConnection');
    getAllConnectionsSpy = jest.spyOn(userFunctions, 'getAllConnections');
    removeUserFromGameSpy = jest.spyOn(gamesFunctions, 'removeUserFromGame');
  });

  afterEach(() => {
    AWSMock.restore('ApiGatewayManagementApi');
    expect.hasAssertions();

    deleteConnectionSpy.mockRestore();
    getAllConnectionsSpy.mockRestore();
    removeUserFromGameSpy.mockRestore();
  });

  test('it should delete the connection and the game that is created by that connection (host)', async () => {
    const expectedResponse = response(200, 'Connection deleted successfully');

    await LambdaTester(handler)
      .event(event)
      .expectResult((result: LambdaResponse) => {
        expect(result).toStrictEqual(expectedResponse);
      });

    expect(deleteConnectionSpy).toHaveBeenCalledTimes(1);
    expect(getAllConnectionsSpy).toHaveBeenCalledTimes(1);
    expect(removeUserFromGameSpy).toHaveBeenCalledTimes(1);
    expect(deleteConnectionSpy).toHaveBeenCalledWith(FAKE_CONNECTION_ID1);

    // User is host, game should be deleted
    const updatedGame = await getGameByGameId(gameId);
    expect(updatedGame).toBeUndefined();
  });

  test('it should delete the connection and remove user from any game the user is part of', async () => {
    await saveConnection(FAKE_CONNECTION_ID2);
    await addUserToGame(gameId, FAKE_CONNECTION_ID2);
    await setGameIdForUser(FAKE_CONNECTION_ID2, gameId);

    const expectedResponse = response(200, 'Connection deleted successfully');

    const newEvent = createEvent({
      connectionId: FAKE_CONNECTION_ID2,
      eventBodyJSON: mockResponseJSON,
    });
    await LambdaTester(handler)
      .event(newEvent)
      .expectResult((result: LambdaResponse) => {
        expect(result).toStrictEqual(expectedResponse);
      });

    expect(deleteConnectionSpy).toHaveBeenCalledTimes(1);
    expect(getAllConnectionsSpy).toHaveBeenCalledTimes(1);
    expect(removeUserFromGameSpy).toHaveBeenCalledTimes(1);
    expect(deleteConnectionSpy).toHaveBeenCalledWith(FAKE_CONNECTION_ID2);

    // User is not host, game should not be deleted
    const updatedGame = (await getGameByGameId(gameId)) as Game;
    const connectionIdsInGame = getConnectionIdsFromUsers(updatedGame.users);
    expect(updatedGame).not.toBeUndefined();
    expect(connectionIdsInGame.includes(FAKE_CONNECTION_ID2)).toBeFalsy();
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
    expect(deleteConnectionSpy).toHaveBeenCalledWith(FAKE_CONNECTION_ID1);
  });
});
