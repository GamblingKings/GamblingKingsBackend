import { Handler } from 'aws-lambda';
import { deleteGame, removeUserFromGame } from '../module/gameDBService';
import { response } from '../utils/responseHelper';
import { Logger } from '../utils/Logger';
import { WebSocketClient } from '../WebSocketClient';
import { createLeaveResponse, failedWebSocketResponse, successWebSocketResponse } from '../utils/createWSResponse';
import { broadcastGameUpdate, broadcastInGameMessage, broadcastInGameUpdate } from '../utils/broadcast';
import { Game } from '../models/Game';
import { removeDynamoDocumentVersion } from '../utils/dbHelper';
import { LambdaEventBody, WebSocketAPIGatewayEvent } from '../types/event';
import { LambdaEventBodyPayloadOptions } from '../types/payload';
import { LambdaResponse } from '../types/response';
import { WebSocketActions } from '../types/WebSocketActions';
import { GameStates } from '../types/states';

/* ----------------------------------------------------------------------------
 * Handler Helper Functions
 * ------------------------------------------------------------------------- */
/**
 * Helper function for a user to leaves a game.
 * @param {WebSocketClient} ws WebSocketClient
 * @param {string} connectionId connection id
 * @param {string} gameId game id
 */
const leaveGame = async (ws: WebSocketClient, connectionId: string, gameId: string): Promise<Game | undefined> => {
  // Remove user from game
  const updatedGame = await removeUserFromGame(gameId, connectionId);

  if (updatedGame) {
    // Remove document version on game object
    removeDynamoDocumentVersion<Game>(updatedGame);
    console.log('Updated game after leaving a game:', updatedGame);

    // Send success response
    const res = createLeaveResponse({ game: updatedGame });
    const updatedGameResponse = successWebSocketResponse(res);
    await ws.send(updatedGameResponse, connectionId);
  }

  return updatedGame;
};

/**
 * Helper function to send updates to other users in the game when a new user leaves the game.
 * @param {WebSocketClient} ws WebSocketClient
 * @param {string} connectionId connection id
 * @param {Game} updatedGame updated game object
 */
const sendUpdates = async (ws: WebSocketClient, connectionId: string, updatedGame: Game): Promise<void> => {
  const connectionIds = updatedGame.users.map((user) => user.connectionId);
  await broadcastInGameMessage(ws, connectionId, WebSocketActions.LEAVE_GAME, connectionIds);

  // 1. If the host leaves the game,
  // send GAME_UPDATE with DELETE state to other users in the game,
  // and also delete the game in the table
  const { host, gameId } = updatedGame;
  if (host.connectionId === connectionId) {
    await broadcastGameUpdate(ws, gameId, GameStates.DELETED, connectionId);
    await deleteGame(gameId);
  } else {
    // 2. If other user leaves the game,
    // send IN_GAME_UPDATE to other users in the game
    await broadcastInGameUpdate(ws, connectionId, updatedGame.users);
  }
};

/* ----------------------------------------------------------------------------
 * Handler
 * ------------------------------------------------------------------------- */

/**
 * Handler for leaving a game.
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
    /**
     * Leaves game
     * 1. Remove user from game
     * 2. Send success response
     */
    const updatedGame = await leaveGame(ws, connectionId, gameId);

    /**
     * Send message to other users in the game
     * 1. Send IN_GAME_MESSAGE when a user leaves a game, no matter the user is a host or not
     * 2. Send GAME_UPDATE to other users in the game
     */
    if (updatedGame) await sendUpdates(ws, connectionId, updatedGame);

    return response(200, 'Left game successfully');
  } catch (err) {
    console.error(JSON.stringify(err));

    // Send failure response
    const emptyGameResponse = createLeaveResponse(undefined);
    const wsResponse = failedWebSocketResponse(emptyGameResponse, JSON.stringify(err));
    await ws.send(wsResponse, connectionId);

    return response(500, err);
  }
};
