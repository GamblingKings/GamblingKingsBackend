import { Handler } from 'aws-lambda';
import { deleteConnection, getAllConnections } from '../module/userDBService';
import { response } from '../utils/responseHelper';
import { Logger } from '../utils/Logger';
import { WebSocketAPIGatewayEvent } from '../types/event';
import { LambdaResponse } from '../types/response';
import { removeUserFromGame } from '../module/gameDBService';
import { User } from '../models/User';
import { WebSocketClient } from '../WebSocketClient';
import { getConnectionIdsFromUsers, sendUpdates } from './functionsHelper';
import { broadcastUserUpdate } from '../utils/broadcast';
import { UserStates } from '../types/states';
import { Game } from '../models/Game';

/* ----------------------------------------------------------------------------
 * Handler Helper Functions
 * ------------------------------------------------------------------------- */

/**
 * Additional cleanup when user disconnect
 * @param {WebSocketClient} ws
 * @param {User} deletedUser
 */
const cleanupUserWhenDisconnect = async (ws: WebSocketClient, deletedUser: User): Promise<Game | undefined> => {
  // TODO: Optimize this cleanup process
  let updatedGame: Game | undefined;
  const { gameId, connectionId } = deletedUser;

  // Remove user from the game (if there is gameId attribute on the user)
  if (gameId) {
    updatedGame = await removeUserFromGame(gameId, connectionId);
  }

  return updatedGame;
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
      // 1. Remove the disconnected user from the game
      const updatedGame = await cleanupUserWhenDisconnect(ws, deletedUser);

      // 2. Delete the game if the user is the host of the game and send updates to other users
      // (see comments in the function for more details)
      if (updatedGame) await sendUpdates(ws, deletedUser.connectionId, updatedGame);
    }

    // Send USER_UPDATE with DISCONNECT to all other users
    const connectionIds = getConnectionIdsFromUsers(await getAllConnections());
    const connectionIdsExceptCaller = connectionIds.filter((otherConnectionId) => otherConnectionId !== connectionId);
    await broadcastUserUpdate(ws, connectionId, UserStates.DISCONNECTED, connectionIdsExceptCaller);

    return response(200, 'Connection deleted successfully');
  } catch (err) {
    console.error(JSON.stringify(err));
    return response(500, err);
  }
};
