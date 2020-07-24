import { WebSocketClient } from '../WebSocketClient';
import { User } from '../../models/User';
import { getAllConnections } from '../../dynamodb/userDBService';
import { createSendMessageResponse } from '../createWSResponse';

/* ----------------------------------------------------------------------------
 * Message
 * ------------------------------------------------------------------------- */

/**
 * Broadcast a message to all users.
 * @param {WebSocketClient} ws a WebSocketClient instance
 * @param {string} username username of the user who send the message to all other users
 * @param {string} message message content
 */
export const broadcastMessage = async (
  ws: WebSocketClient,
  username: string,
  message: string,
): Promise<User[] | []> => {
  const users: User[] = await getAllConnections();
  console.log('broadcastMessage, Connections:', users);

  if (users && users.length > 0) {
    const wsResponse = createSendMessageResponse({
      username,
      message,
    });

    // Send a message to all the active connections
    await Promise.all(
      users.map((connection) => {
        // Send all connections to all users
        return ws.send(wsResponse, connection.connectionId);
      }),
    );
  }

  return users || [];
};
