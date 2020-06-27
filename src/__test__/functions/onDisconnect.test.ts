import * as LambdaTester from 'lambda-tester';
import { handler } from '../../functions/onDisconnect';
import * as userFunctions from '../../dynamodb/userDBService';
import * as gamesFunctions from '../../dynamodb/gameDBService';
import { response } from '../../utils/responseHelper';
import { createEvent } from './functionsTestHelpers';
import { LambdaResponse } from '../../types/response';
import {
  FAKE_CONNECTION_ID1,
  FAKE_CONNECTION_ID2,
  FAKE_USERNAME1,
  FAKE_USERNAME2,
  TEST_GAME_OBJECT1,
} from '../testConstants';
import { saveConnection, setGameIdForUser, setUsername } from '../../dynamodb/userDBService';
import { addUserToGame, createGame, getGameByGameId } from '../../dynamodb/gameDBService';
import { Game } from '../../models/Game';
import { getConnectionIdsFromUsers } from '../../websocket/broadcast';

jest.mock('../../websocket/WebSocketClient');

describe('test onDisconnect', () => {
  let game: Game;
  let gameId: string;

  // Event
  const mockResponseJSON = { action: '', payload: { message: ' ' } };
  const event = createEvent({
    connectionId: FAKE_CONNECTION_ID1,
    eventBodyJSON: mockResponseJSON,
  });

  // Spies
  let deleteConnectionSpy: jest.SpyInstance;
  let getAllConnectionsSpy: jest.SpyInstance;
  let removeUserFromGameSpy: jest.SpyInstance;

  beforeEach(async () => {
    await saveConnection(FAKE_CONNECTION_ID1);
    await setUsername(FAKE_CONNECTION_ID1, FAKE_USERNAME1);
    game = await createGame({
      creatorConnectionId: FAKE_CONNECTION_ID1,
      gameName: TEST_GAME_OBJECT1.gameName,
      gameType: TEST_GAME_OBJECT1.gameType,
      gameVersion: TEST_GAME_OBJECT1.gameVersion,
    });
    gameId = game.gameId;
    await setGameIdForUser(FAKE_CONNECTION_ID1, gameId);

    deleteConnectionSpy = jest.spyOn(userFunctions, 'deleteConnection');
    getAllConnectionsSpy = jest.spyOn(userFunctions, 'getAllConnections');
    removeUserFromGameSpy = jest.spyOn(gamesFunctions, 'removeUserFromGame');
  });

  afterEach(() => {
    jest.restoreAllMocks();
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
    await setUsername(FAKE_CONNECTION_ID2, FAKE_USERNAME2);
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
