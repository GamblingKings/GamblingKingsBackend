import { Handler } from 'aws-lambda';
import { addUserToGame } from '../module/gameDBService';
import { response } from '../utils/responseHelper';
import { Logger } from '../utils/Logger';
import { WebSocketClient } from '../WebSocketClient';
import { createJoinGameResponse, failedWebSocketResponse, successWebSocketResponse } from '../utils/createWSResponse';
import { broadcastInGameMessage, broadcastInGameUpdate } from '../utils/broadcast';
import { removeGameDocumentVersion } from '../utils/dbHelper';
import { Game } from '../models/Game';
import { LambdaEventBody, WebSocketAPIGatewayEvent } from '../types/event';
import { LambdaEventBodyPayloadOptions } from '../types/payload';
import { LambdaResponse } from '../types/response';
import { WebSocketActions } from '../types/WebSocketActions';

/**
 * Handler for joining a game.
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  // Logger
  Logger.createLogTitle('onJoinGame.ts');

  // Parse event
  const { connectionId } = event.requestContext;
  const body: LambdaEventBody = JSON.parse(event.body);
  const { payload }: { payload: LambdaEventBodyPayloadOptions } = body;
  const gameId = payload.gameId as string;

  // Join game
  console.log('Updating a game in the db table...');
  const ws = new WebSocketClient(event.requestContext);
  try {
    // Add user to game
    const updatedGame = await addUserToGame(gameId, connectionId);
    removeGameDocumentVersion<Game>(updatedGame);
    console.log('Updated game:', updatedGame);

    // Send success response
    const res = createJoinGameResponse({ game: updatedGame });
    const updatedGameResponse = successWebSocketResponse(res);
    await ws.send(JSON.stringify(updatedGameResponse), connectionId);

    // Send message to other users in the game
    const connectionIds = updatedGame.users.map((user) => user.connectionId);
    await broadcastInGameMessage(ws, connectionId, WebSocketActions.JOIN_GAME, connectionIds);

    // Send updated users list to other users in the game
    await broadcastInGameUpdate(ws, connectionId, updatedGame.users);

    return response(200, 'Joined game successfully');
  } catch (err) {
    console.error(err);

    // Send failure response
    const emptyGameResponse = createJoinGameResponse(undefined);
    const res = failedWebSocketResponse(emptyGameResponse, err);
    await ws.send(JSON.stringify(res), connectionId);

    return response(500, err);
  }
};
