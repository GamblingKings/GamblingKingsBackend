import { WebSocketClient } from '../websocket/WebSocketClient';
import { Game } from '../models/Game';
import {
  broadcastGameUpdate,
  broadcastInGameMessage,
  broadcastInGameUpdate,
  getConnectionIdsFromUsers,
} from '../websocket/broadcast';
import { WebSocketActions } from '../types/WebSocketActions';
import { GameStates } from '../types/states';
import { deleteGame } from '../dynamodb/gameDBService';

/**
 * Helper function to send updates to other users in the game when a user leaves the game.
 * @param {WebSocketClient} ws WebSocketClient
 * @param {string} connectionId connection id
 * @param {Game} updatedGame updated game object
 * @param {string} username caller's username (used when host disconnects)
 * @param {string[]} allConnectionIds all connection Ids (used when host disconnects)
 */
export const sendUpdates = async (
  ws: WebSocketClient,
  connectionId: string,
  updatedGame: Game,
  username: string | undefined = undefined,
  allConnectionIds: string[] = [],
): Promise<void> => {
  const connectionIds = getConnectionIdsFromUsers(updatedGame.users);
  await broadcastInGameMessage(ws, connectionId, WebSocketActions.LEAVE_GAME, connectionIds, username);

  const { host, gameId, started } = updatedGame;

  /**
   * Current implementation
   * 1. game.started = false
   * if user is the host, 1) delete the game and 2) send GAME_UPDATE
   * else, 1) send IN_GAME_UPDATE
   *
   * 2. game.started = true
   * DON'T delete the game
   * 1) send IN_GAME_UPDATE
   */

  // If the game is not started yet
  if (!started) {
    // If the host leaves the game,
    // 1) send GAME_UPDATE with DELETE state all users (including the host)
    //    in the game since the game is going to be deleted
    // 2) and delete the game in the table
    if (host.connectionId === connectionId) {
      await broadcastGameUpdate(ws, gameId, GameStates.DELETED, connectionId, allConnectionIds, true);
      await deleteGame(gameId);
      return;
    }
  }

  // If other user leaves the game, DON'T delete the game and
  // 1) send IN_GAME_UPDATE to other users in the game,
  await broadcastInGameUpdate(ws, connectionId, updatedGame.users);
};
