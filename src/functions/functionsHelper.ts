import { WebSocketClient } from '../WebSocketClient';
import { Game } from '../models/Game';
import {
  broadcastGameUpdate,
  broadcastInGameMessage,
  broadcastInGameUpdate,
  broadcastUserUpdate,
} from '../utils/broadcast';
import { WebSocketActions } from '../types/WebSocketActions';
import { GameStates, UserStates } from '../types/states';
import { deleteGame } from '../module/gameDBService';
import { User } from '../models/User';

/**
 * Helper function to send updates to other users in the game when a user leaves the game.
 * @param {WebSocketClient} ws WebSocketClient
 * @param {string} connectionId connection id
 * @param {Game} updatedGame updated game object
 */
export const sendUpdates = async (ws: WebSocketClient, connectionId: string, updatedGame: Game): Promise<void> => {
  const connectionIds = updatedGame.users.map((user) => user.connectionId);
  await broadcastInGameMessage(ws, connectionId, WebSocketActions.LEAVE_GAME, connectionIds);

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
    // 1) send GAME_UPDATE with DELETE state to other users in the game,
    // 2) and delete the game in the table
    if (host.connectionId === connectionId) {
      await deleteGame(gameId);
      await broadcastGameUpdate(ws, gameId, GameStates.DELETED, connectionId);
      return;
    }
  }

  // If other user leaves the game, DON'T delete the game and
  // 1) send IN_GAME_UPDATE to other users in the game,
  await broadcastInGameUpdate(ws, connectionId, updatedGame.users);
};

export const getConnectionIdsFromUsers = (usersList: User[]): string[] => {
  return usersList.map((user) => user.connectionId);
};
