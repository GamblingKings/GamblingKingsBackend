import { createInteractionSuccessResponse } from '../createWSResponse';
import { InteractionSuccessPayload } from '../../types/payload';
import { WebSocketClient } from '../WebSocketClient';

/* ----------------------------------------------------------------------------
 * GameState
 * ------------------------------------------------------------------------- */

/**
 * Send INTERACTION_SUCCESS message to all users in the game.
 * @param {WebSocketClient} ws a WebSocketClient instance
 * @param {InteractionSuccessPayload} wsPayload
 * @param {string[]} connectionIds connection Ids of the all users who are in the same game
 */
export const broadcastInteractionSuccess = async (
  ws: WebSocketClient,
  wsPayload: InteractionSuccessPayload,
  connectionIds: string[],
): Promise<InteractionSuccessPayload> => {
  const successWsResponse = createInteractionSuccessResponse(wsPayload);

  // Send played tile interaction to all other users in the game
  await Promise.all(connectionIds.map((connectionId) => ws.send(successWsResponse, connectionId)));

  return wsPayload;
};
