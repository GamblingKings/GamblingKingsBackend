import { WebSocketClient } from '../WebSocketClient';
import { User } from '../../models/User';
import { getAllConnections, getUserByConnectionId } from '../../dynamodb/userDBService';
import { createGetAllUsersResponse, createUserUpdateResponse } from '../createWSResponse';
import { UserStates } from '../../types/states';
import { getConnectionIdsExceptCaller } from '../../utils/broadcastHelper';

/* ----------------------------------------------------------------------------
 * User
 * ------------------------------------------------------------------------- */

/**
 * Broadcast all the connections to a user.
 * @param {WebSocketClient} ws a WebSocketClient instance
 * @param {string} connectionId connection Id
 */
export const broadcastConnections = async (ws: WebSocketClient, connectionId: string): Promise<User[] | []> => {
  const users: User[] = await getAllConnections();

  if (users && users.length > 0) {
    console.log('broadcastConnections, Connections:', users);

    // Create users response object
    const wsResponse = createGetAllUsersResponse({
      users,
    });

    // Send all the active connections to a user
    await ws.send(wsResponse, connectionId);
  }

  return users || [];
};

/**
 * Broadcast user update to every other user (except the one with connectionId specified in the argument)
 * @param {WebSocketClient} ws WebSocket client
 * @param {string} callerConnectionId connection Id
 * @param {UserStates} state user state
 * @param allConnectionIds connection ids from all the currently connected users
 */
export const broadcastUserUpdate = async (
  ws: WebSocketClient,
  callerConnectionId: string,
  state: UserStates,
  allConnectionIds: string[],
): Promise<User | undefined> => {
  const currentUser = await getUserByConnectionId(callerConnectionId);
  console.log('broadcastUserUpdate, User update:', currentUser);

  if (currentUser) {
    const wsResponse = createUserUpdateResponse({
      user: currentUser,
      state,
    });

    const otherConnectionIds = getConnectionIdsExceptCaller(callerConnectionId, allConnectionIds);
    await Promise.all(
      otherConnectionIds.map((otherConnectionId) => {
        return ws.send(wsResponse, otherConnectionId);
      }),
    );
  }

  return currentUser;
};
