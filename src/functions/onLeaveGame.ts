import { Handler } from 'aws-lambda';
import { deleteGame, removeUserFromGame } from '../module/gameDBService';
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
import { broadcastGameUpdate, broadcastInGameMessage, broadcastInGameUpdate } from '../utils/broadcast';
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
    // Remove user from game
    const updatedGame = (await removeUserFromGame(gameId, connectionId)) as Game;
    removeGameDocumentVersion<Game>(updatedGame);
    console.log('Updated game after leaving a game:', updatedGame);

    // Send success response
    const res = createLeaveResponse(updatedGame);
    const updatedGameResponse = successWebSocketResponse(res);
    await ws.send(JSON.stringify(updatedGameResponse), connectionId);

    // Send message to other users in the game
    // 1. If the host leaves the game,
    // send GAME_UPDATE with DELETE state to other user in the game and also delete the game in the table
    const { host } = updatedGame;
    if (host.connectionId === connectionId) {
      await broadcastGameUpdate(ws, gameId, GameStates.DELETED, connectionId);
      await deleteGame(gameId);
    } else {
      // 2. If the other user leaves the game,
      // send IN_GAME_MESSAGE, IN_GAME_UPDATE to other users in the game
      const connectionIds = updatedGame.users.map((user) => user.connectionId);
      await broadcastInGameMessage(ws, connectionId, WebSocketActions.LEAVE_GAME, connectionIds);

      // Send updated users list to other users in the game
      await broadcastInGameUpdate(ws, connectionId, updatedGame.users);
    }

    return response(200, 'Left game successfully');
  } catch (err) {
    console.error(err);

    // Send failure response
    const emptyGameResponse = createLeaveResponse(undefined);
    const res = failedWebSocketResponse(emptyGameResponse, err);
    await ws.send(JSON.stringify(res), connectionId);

    return response(500, err);
  }
};
