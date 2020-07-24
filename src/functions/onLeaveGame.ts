import { Handler } from 'aws-lambda';
import { removeUserFromGame } from '../dynamodb/gameDBService';
import { response } from '../utils/responseHelper';
import { Logger } from '../utils/Logger';
import { WebSocketClient } from '../websocket/WebSocketClient';
import { createLeaveResponse, failedWebSocketResponse, successWebSocketResponse } from '../websocket/createWSResponse';
import { Game } from '../models/Game';
import { removeDynamoDocumentVersion } from '../dynamodb/dbHelper';
import { LambdaEventBody, WebSocketAPIGatewayEvent } from '../types/event';
import { LambdaEventBodyPayloadOptions } from '../types/payload';
import { LambdaResponse } from '../types/response';
import { getAllConnections, removeGameIdFromUser } from '../dynamodb/userDBService';
import { sendUpdates } from './functionsHelper';
import { getConnectionIdsFromUsers } from '../utils/broadcastHelper';

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

  // Remove gameId from the user
  await removeGameIdFromUser(connectionId);

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

/* ----------------------------------------------------------------------------
 * Handler
 * ------------------------------------------------------------------------- */

/**
 * Handler for leaving a game.
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  // Logger
  Logger.createLogTitle('onLeaveGame.ts');

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
    const allConnectionIds = getConnectionIdsFromUsers(await getAllConnections());
    if (updatedGame) await sendUpdates(ws, connectionId, updatedGame, undefined, allConnectionIds);

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
