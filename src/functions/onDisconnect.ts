import { Handler } from 'aws-lambda';
import { deleteConnection } from '../module/userDBService';
import { response } from '../utils/responseHelper';
import { Logger } from '../utils/Logger';
import { WebSocketAPIGatewayEvent } from '../types/event';
import { LambdaResponse } from '../types/response';
import { removeUserFromGame } from '../module/gameDBService';
import { User } from '../models/User';
import { WebSocketClient } from '../WebSocketClient';
import { sendUpdates } from './functionsHelper';

/* ----------------------------------------------------------------------------
 * Handler Helper Functions
 * ------------------------------------------------------------------------- */

/**
 * Additional cleanup when user disconnect
 * @param {WebSocketClient} ws
 * @param {User} deletedUser
 */
const cleanupUserWhenDisconnect = async (ws: WebSocketClient, deletedUser: User) => {
  // TODO: Optimize this cleanup process
  const { gameId, connectionId } = deletedUser;

  // 1. Remove user from game (if there is gameId attribute on the user)
  if (gameId) {
    const updatedGame = await removeUserFromGame(gameId, connectionId);

    // 2. Delete the game if the user is the host of the game and send updates to other users
    if (updatedGame) await sendUpdates(ws, deletedUser.connectionId, updatedGame);
  }
};

/* ----------------------------------------------------------------------------
 * Handler
 * ------------------------------------------------------------------------- */

/**
 * Handler for websocket disconnect.
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  Logger.createLogTitle('onDisconnect.ts');

  const { connectionId } = event.requestContext;

  console.log('Deleting connectionId from the db table...');
  const ws = new WebSocketClient(event.requestContext);
  try {
    // Delete user from ConnectionsTable
    const deletedUser = await deleteConnection(connectionId);

    // Additional cleanup when user disconnect
    if (deletedUser) {
      await cleanupUserWhenDisconnect(ws, deletedUser);
    }

    return response(200, 'Connection deleted successfully');
  } catch (err) {
    console.error(JSON.stringify(err));
    return response(500, err);
  }
};
