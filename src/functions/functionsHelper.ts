import { WebSocketClient } from '../websocket/WebSocketClient';
import { Game } from '../models/Game';
import { WebSocketActionsEnum } from '../enums/WebSocketActionsEnum';
import { GameStatesEnum } from '../enums/states';
import { deleteGame } from '../dynamodb/gameDBService';
import {
  broadcastGameUpdate,
  broadcastInGameMessage,
  broadcastInGameUpdate,
} from '../websocket/broadcast/gameBroadcast';
import { getConnectionIdsFromUsers } from '../utils/broadcastHelper';
import { deleteGameState } from '../dynamodb/gameStateDBService';
import { sendUpdateResult } from '../types/gameUpdate';
import { removeGameIdFromUser } from '../dynamodb/userDBService';

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
): Promise<sendUpdateResult> => {
  const connectionIds = getConnectionIdsFromUsers(updatedGame.users);
  await broadcastInGameMessage(ws, connectionId, WebSocketActionsEnum.LEAVE_GAME, connectionIds, username);

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

  const updateResult: sendUpdateResult = { isGameDeleted: false };

  // If the game is not started yet
  if (!started) {
    // If the host leaves the game,
    // 1) send GAME_UPDATE with DELETE state all users (including the host)
    //    in the game since the game is going to be deleted
    // 2) Delete the game/game state in the table
    // 3) Remove gameId from user
    if (host.connectionId === connectionId) {
      // 1)
      await broadcastGameUpdate(ws, gameId, GameStatesEnum.DELETED, connectionId, allConnectionIds, true);

      // 2)
      await deleteGame(gameId);
      await deleteGameState(gameId);

      // 3)
      const otherConnectionIds = connectionIds.filter((cid) => cid !== host.connectionId);
      await Promise.all(otherConnectionIds.map((cid) => removeGameIdFromUser(cid)));

      updateResult.isGameDeleted = true;
      return updateResult;
    }
  }

  // If other user leaves the game, DON'T delete the game and
  // 1) send IN_GAME_UPDATE to other users in the game,
  await broadcastInGameUpdate(ws, connectionId, updatedGame.users);

  return updateResult;
};
