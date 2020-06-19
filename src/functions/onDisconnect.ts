import { Handler } from 'aws-lambda';
import { deleteConnection } from '../module/userDBService';
import { response } from '../utils/responseHelper';
import { Logger } from '../utils/Logger';
import { WebSocketAPIGatewayEvent } from '../types/event';
import { LambdaResponse } from '../types/response';
import { deleteGame, removeUserFromGame } from '../module/gameDBService';
import { User } from '../models/User';

/* ----------------------------------------------------------------------------
 * Handler Helper Functions
 * ------------------------------------------------------------------------- */

/**
 * Additional cleanup when user disconnect
 * @param deletedUser
 */
const cleanupUserWhenDisconnect = async (deletedUser: User) => {
  // TODO: Optimize this cleanup process
  const { gameId, connectionId } = deletedUser;

  // 1. Remove user from game (if there is gameId attribute on the user)
  if (gameId) {
    const updatedGame = await removeUserFromGame(gameId, connectionId);

    // 2. Delete the game if the user is the host of the game
    if (updatedGame && updatedGame.host.connectionId === connectionId) {
      await deleteGame(gameId);
    }
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
  try {
    // Delete user from ConnectionsTable
    const deletedUser = await deleteConnection(connectionId);

    // Additional cleanup when user disconnect
    if (deletedUser) {
      await cleanupUserWhenDisconnect(deletedUser);
    }

    return response(200, 'Connection deleted successfully');
  } catch (err) {
    console.error(err);
    return response(500, err);
  }
};
