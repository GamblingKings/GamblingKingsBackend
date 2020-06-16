import { Handler } from 'aws-lambda';
import { removeUserFromGame } from '../module/gameDBService';
import {
  GameStates,
  LambdaEventBody,
  LambdaEventBodyPayloadOptions,
  LambdaResponse,
  WebSocketActions,
  WebSocketAPIGatewayEvent,
} from '../types';
import { response } from '../utils/response';
import { Logger } from '../utils/Logger';
import { WebSocketClient } from '../WebSocketClient';
import { createLeaveResponse, failedWebSocketResponse, successWebSocketResponse } from '../utils/webSocketActions';
import { broadcastGameUpdate, broadcastInGameMessage } from '../utils/broadcast';
import { Game } from '../models/Game';
import { removeGameDocumentVersion } from '../utils/dbHelper';

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

  // Leave game
  console.log('Leaving a game...');
  const ws = new WebSocketClient(event.requestContext);
  try {
    // Send success response
    const updatedGame = (await removeUserFromGame(gameId, connectionId)) as Game;
    removeGameDocumentVersion<Game>(updatedGame);
    console.log('Updated game after leaving a game:', updatedGame);

    const res = createLeaveResponse(updatedGame);
    const updatedGameResponse = successWebSocketResponse(res);
    await ws.send(JSON.stringify(updatedGameResponse), connectionId);

    // Send message to other users in the game
    const { host } = updatedGame;
    if (host) {
      await broadcastGameUpdate(ws, gameId, GameStates.DELETED, connectionId);
    } else {
      await broadcastInGameMessage(ws, gameId, connectionId, WebSocketActions.LEAVE_GAME);
    }

    return response(200, 'Joined game successfully');
  } catch (err) {
    console.error(err);

    // Send failure response
    const emptyGameResponse = createLeaveResponse(undefined);
    const res = failedWebSocketResponse(emptyGameResponse, err);
    await ws.send(JSON.stringify(res), connectionId);

    return response(500, err);
  }
};
