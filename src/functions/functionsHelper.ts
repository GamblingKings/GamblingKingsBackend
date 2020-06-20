import { WebSocketClient } from '../WebSocketClient';
import { Game } from '../models/Game';
import { broadcastGameUpdate, broadcastInGameMessage, broadcastInGameUpdate } from '../utils/broadcast';
import { WebSocketActions } from '../types/WebSocketActions';
import { GameStates } from '../types/states';
import { deleteGame } from '../module/gameDBService';

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
   * 1) DON'T delete the game send IN_GAME_UPDATE
   */

  // If the game is not started yet
  if (!started) {
    // If the host leaves the game,
    // send GAME_UPDATE with DELETE state to other users in the game,
    // and also delete the game in the table
    if (host.connectionId === connectionId) {
      await broadcastGameUpdate(ws, gameId, GameStates.DELETED, connectionId);
      await deleteGame(gameId);
      return;
    }
  }

  // If other user leaves the game, don't delete the game and
  // send IN_GAME_UPDATE to other users in the game
  await broadcastInGameUpdate(ws, connectionId, updatedGame.users);
};
