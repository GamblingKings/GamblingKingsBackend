import { WebSocketClient } from '../WebSocketClient';
import { getAllConnections, getUserByConnectionId } from '../module/userDBService';
import { getAllGames, getGameByGameId } from '../module/gameDBService';
import { User } from '../models/User';
import { Game } from '../models/Game';
import {
  createGameUpdateResponse,
  createInGameMessageResponse,
  createInGameUpdateResponse,
  createUserUpdateResponse,
  createGetAllGamesResponse,
  createGetAllUsersResponse,
  createSendMessageResponse,
} from './createWSResponse';
import { removeDynamoDocumentVersion } from './dbHelper';
import { WebSocketActions } from '../types/WebSocketActions';
import { GameStates, UserStates } from '../types/states';

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
    console.log('Connections:', users);
    console.log('Type of Connections:', typeof users);

    // Create users response object
    const jsonWsResponse = JSON.stringify(
      createGetAllUsersResponse({
        users,
      }),
    );

    // Send all the active connections to a user
    await ws.send(jsonWsResponse, connectionId);
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

  if (currentUser) {
    const jsonWsResponse = JSON.stringify(
      createUserUpdateResponse({
        user: currentUser,
        state,
      }),
    );

    const promises = allConnectionIds.map(async (otherConnectionId) => {
      if (otherConnectionId !== callerConnectionId) {
        return ws.send(jsonWsResponse, otherConnectionId);
      }
      // Do nothing
      return null;
    });

    await Promise.all(promises);
  }

  return currentUser;
};

/* ----------------------------------------------------------------------------
 * Game
 * ------------------------------------------------------------------------- */

/**
 * Broadcast all the currently active games to a user.
 * @param {WebSocketClient} ws a WebSocketClient instance
 * @param {string} connectionId connection Id
 */
export const broadcastGames = async (ws: WebSocketClient, connectionId: string): Promise<Game[] | []> => {
  const games = await getAllGames();
  games.forEach((game) => {
    removeDynamoDocumentVersion<Game>(game);
  });

  // Make games an empty array if games are empty
  console.log('Games:', games);

  // Create games response object
  const jsonWsResponse = JSON.stringify(
    createGetAllGamesResponse({
      games,
    }),
  );

  // Send all games each user
  await ws.send(jsonWsResponse, connectionId);

  return games || [];
};

/**
 * Broadcast game update to all users except the game host
 * @param {WebSocketClient} ws WebSocket client
 * @param {string} gameId game Id
 * @param {GameStates} state of the game
 * @param callerConnectionId caller's connection Id
 */
export const broadcastGameUpdate = async (
  ws: WebSocketClient,
  gameId: string,
  state: GameStates,
  callerConnectionId: string,
): Promise<Game | undefined> => {
  // Get updated game info
  const updatedGame = await getGameByGameId(gameId);
  removeDynamoDocumentVersion<Game>(updatedGame);

  if (updatedGame) {
    // Get all connection Ids
    const users = await getAllConnections();
    const connections = users.map((user) => user.connectionId);

    // Send game update to all other users (except the caller or the game creator)
    const promises = connections.map((otherConnectionId) => {
      if (otherConnectionId !== callerConnectionId) {
        const jsonWsResponse = JSON.stringify(
          createGameUpdateResponse({
            game: updatedGame,
            state,
          }),
        );
        return ws.send(jsonWsResponse, otherConnectionId);
      }

      // Do nothing
      return null;
    });

    await Promise.all(promises);
  }

  return updatedGame;
};

/**
 * Broadcast a message about who is joining the game with the IN_GAME_MESSAGE action
 * @param {WebSocketClient} ws a WebSocketClient instance
 * @param {string} callConnectionId caller's connection Id
 * @param {WebSocketActions.JOIN_GAME | WebSocketActions.LEAVE_GAME} action join or leave game action
 * @param {string[]} connectionIds connection Ids of all users who are in the same game
 */
export const broadcastInGameMessage = async (
  ws: WebSocketClient,
  callConnectionId: string,
  action: WebSocketActions.JOIN_GAME | WebSocketActions.LEAVE_GAME,
  connectionIds: string[],
): Promise<User | undefined> => {
  // Get joining user's username
  const user = await getUserByConnectionId(callConnectionId);

  if (user) {
    const username = user.username || 'Unknown User'; // TODO: change to a more appropriate name

    // Format message
    const actionWord: string = action === WebSocketActions.JOIN_GAME ? 'joined' : 'left';
    const message = `${username || callConnectionId} just ${actionWord} the game.`;

    // Send message to the other connectionIds that are already in the game
    const otherConnectionIds = connectionIds.filter((otherConnectionId) => otherConnectionId !== callConnectionId);
    const jsonWsResponse = JSON.stringify(createInGameMessageResponse(username, message));
    await Promise.all(
      otherConnectionIds.map((otherConnectionId) => {
        return ws.send(jsonWsResponse, otherConnectionId);
      }),
    );
  }

  return user || undefined;
};

/**
 * Broadcast in game update about the current users list in the game
 * @param {WebSocketClient} ws a WebSocketClient instance
 * @param {string} callConnectionId caller's connection Id
 * @param {User[]} usersInGame current users list in the game
 */
export const broadcastInGameUpdate = async (
  ws: WebSocketClient,
  callConnectionId: string,
  usersInGame: User[],
): Promise<User[]> => {
  // Send users list to the other connectionIds that are already in the game
  const otherConnectionIds = usersInGame.filter((user) => user.connectionId !== callConnectionId);
  const jsonWsResponse = JSON.stringify(
    createInGameUpdateResponse({
      users: usersInGame,
    }),
  );
  await Promise.all(
    otherConnectionIds.map((otherUser) => {
      return ws.send(jsonWsResponse, otherUser.connectionId);
    }),
  );

  return usersInGame;
};

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

  if (users && users.length > 0) {
    const jsonWsResponse = JSON.stringify(
      createSendMessageResponse({
        username,
        message,
      }),
    );

    // Send all the active connections to all the users
    await Promise.all(
      users.map((connection) => {
        // Send all connections to all users
        return ws.send(jsonWsResponse, connection.connectionId);
      }),
    );
  }

  return users || [];
};
