import { Handler } from 'aws-lambda';
import { createGame } from '../module/gameDBService';
import { response } from '../utils/responseHelper';
import { Logger } from '../utils/Logger';
import { WebSocketClient } from '../WebSocketClient';
import { createGameResponse, successWebSocketResponse, failedWebSocketResponse } from '../utils/createWSResponse';
import { Game } from '../models/Game';
import { broadcastGameUpdate, getConnectionIdsFromUsers } from '../utils/broadcast';
import { removeDynamoDocumentVersion } from '../utils/dbHelper';
import { LambdaEventBody, WebSocketAPIGatewayEvent } from '../types/event';
import { LambdaEventBodyPayloadOptions } from '../types/payload';
import { LambdaResponse } from '../types/response';
import { GameStates } from '../types/states';
import { getAllConnections, setGameIdForUser } from '../module/userDBService';

/**
 * Handler for creating a game.
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  Logger.createLogTitle('onCreateGame.ts');

  const { connectionId } = event.requestContext;
  const body: LambdaEventBody = JSON.parse(event.body);
  const { payload }: { payload: LambdaEventBodyPayloadOptions } = body;
  const { game } = payload;

  console.log('Adding game to the db table...');
  const ws = new WebSocketClient(event.requestContext);
  const emptyGameResponse = createGameResponse(undefined);
  try {
    if (!game) {
      // Send failed response
      const gameResponse = failedWebSocketResponse(emptyGameResponse, 'Games attribute cannot be empty');
      await ws.send(gameResponse, connectionId);

      return response(400, 'Games attribute cannot be empty');
    }

    // Create game
    const { gameName, gameType, gameVersion } = game;
    const returnedGameObj: Game = await createGame({
      creatorConnectionId: connectionId,
      gameName,
      gameType,
      gameVersion,
    });

    // Remove document version on game object
    removeDynamoDocumentVersion<Game>(returnedGameObj);

    // Add gameId as a reference to the current user
    await setGameIdForUser(connectionId, returnedGameObj.gameId);

    // Send success response
    const res = createGameResponse({ game: returnedGameObj });
    const wsResponse = successWebSocketResponse(res);
    await ws.send(wsResponse, connectionId);

    // Send game update to users
    const { gameId } = returnedGameObj;
    const connectionIds = getConnectionIdsFromUsers(await getAllConnections());
    if (gameId) await broadcastGameUpdate(ws, gameId, GameStates.CREATED, connectionId, connectionIds);

    return response(200, 'Game created successfully');
  } catch (err) {
    // Send failed response
    const wsResponse = failedWebSocketResponse(emptyGameResponse, JSON.stringify(err));
    await ws.send(wsResponse, connectionId);
    console.error(JSON.stringify(err));
    return response(500, err);
  }
};
