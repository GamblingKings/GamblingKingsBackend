import { Handler } from 'aws-lambda';
import { deleteConnection, getAllConnections } from '../dynamodb/userDBService';
import { response } from '../utils/responseHelper';
import { Logger } from '../utils/Logger';
import { WebSocketAPIGatewayEvent } from '../types/event';
import { LambdaResponse } from '../types/response';
import { removeUserFromGame } from '../dynamodb/gameDBService';
import { User } from '../models/User';
import { WebSocketClient } from '../websocket/WebSocketClient';
import { UserStates } from '../enums/states';
import { Game } from '../models/Game';
import { sendUpdates } from './functionsHelper';
import { broadcastUserUpdate } from '../websocket/broadcast/userBroadcast';
import { getConnectionIdsFromUsers } from '../utils/broadcastHelper';

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
    // Send USER_UPDATE with DISCONNECT to all other users
    const connectionIds = getConnectionIdsFromUsers(await getAllConnections());
    await broadcastUserUpdate(ws, connectionId, UserStates.DISCONNECTED, connectionIds);

    // Delete user from Connections Table
    const deletedUser = await deleteConnection(connectionId);

    // Additional cleanup when user disconnect
    if (deletedUser) {
      // 1. Remove the disconnected user from the game
      const updatedGame = await cleanupUserWhenDisconnect(ws, deletedUser);

      // 2. Delete the game if the user is the host of the game and send updates to other users
      // (see comments in the function for more details)
      if (updatedGame) {
        await sendUpdates(ws, deletedUser.connectionId, updatedGame, deletedUser.username, connectionIds);
      }
    }

    return response(200, 'Connection deleted successfully');
  } catch (err) {
    console.error(JSON.stringify(err));
    return response(500, err);
  }
};
