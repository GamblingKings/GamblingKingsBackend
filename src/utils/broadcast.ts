import { WebSocketClient } from '../WebSocketClient';
import { getAllConnections, getUserByConnectionId } from '../module/userDBService';
import { getAllGames, getGameByGameId } from '../module/gameDBService';
import { User } from '../models/User';
import { Game } from '../models/Game';
import {
  createGameUpdateResponse,
  createInGameMessageResponse,
  createUserUpdateResponse,
  createWSAllGamesResponse,
  createWSAllUsersResponse,
  createWSMessageResponse,
} from './webSocketActions';
import { GameStates, UserStates, WebSocketActions } from '../types';
import { removeGameDocumentVersion } from './dbHelper';

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
    const jsonWsResponse = JSON.stringify(createWSAllUsersResponse(users));

    // Send all the active connections to a user
    await ws.send(jsonWsResponse, connectionId);
  }

  return users || [];
};

/**
 * Broadcast a message to all users.
 * @param {WebSocketClient} ws a WebSocketClient instance
 * @param {string} username
 * @param {string} msg
 */
export const broadcastMessage = async (ws: WebSocketClient, username: string, msg: string): Promise<User[] | []> => {
  const users: User[] = await getAllConnections();

  if (users && users.length > 0) {
    const jsonWsResponse = JSON.stringify(createWSMessageResponse(username, msg));

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

/**
 * Broadcast all the currently active games to a user.
 * @param {WebSocketClient} ws a WebSocketClient instance
 * @param {string} connectionId connection Id
 */
export const broadcastGames = async (ws: WebSocketClient, connectionId: string): Promise<Game[] | []> => {
  const games = await getAllGames();
  games.forEach((game) => {
    removeGameDocumentVersion<Game>(game);
  });

  // Make games an empty array if games are empty
  console.log('Games:', games);

  // Create games response object
  const jsonWsResponse = JSON.stringify(createWSAllGamesResponse(games));

  // Send all games each user
  await ws.send(jsonWsResponse, connectionId);

  return games || [];
};

/**
 * Broadcast a message about who is joining the game
 * @param {WebSocketClient} ws a WebSocketClient instance
 * @param {string} gameId game Id
 * @param {string} connectionId connection Id
 * @param {WebSocketActions.JOIN_GAME | WebSocketActions.LEAVE_GAME} action join or leave game action
 */
export const broadcastInGameMessage = async (
  ws: WebSocketClient,
  gameId: string,
  connectionId: string,
  action: WebSocketActions.JOIN_GAME | WebSocketActions.LEAVE_GAME,
): Promise<User | undefined> => {
  const game = await getGameByGameId(gameId);
  let users: User[] = [];
  let user;

  if (game) {
    users = game.users;

    // Get joining user's username
    user = await getUserByConnectionId(connectionId);

    if (user) {
      const { username } = user;

      // Format message
      const actionWord: string = action === WebSocketActions.JOIN_GAME ? 'joined' : 'left';
      const msg = `${username || connectionId} just ${actionWord} the game.`;

      // Send message to the other connections that are already in the game
      const otherConnections = users.filter((connection) => connection.connectionId !== connectionId);
      const jsonWsResponse = JSON.stringify(createInGameMessageResponse(msg));
      await Promise.all(
        otherConnections.map((connection) => {
          return ws.send(jsonWsResponse, connection.connectionId);
        }),
      );
    }
  }

  return user || undefined;
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
    const jsonWsResponse = JSON.stringify(createUserUpdateResponse(currentUser, state));

    const promises = allConnectionIds.map(async (otherConnectionId) => {
      if (otherConnectionId !== callerConnectionId) {
        return ws.send(jsonWsResponse, callerConnectionId);
      }
      // Do nothing
      return null;
    });

    await Promise.all(promises);
  }

  return currentUser;
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
  removeGameDocumentVersion<Game>(updatedGame);

  if (updatedGame) {
    // Get all connection Ids
    const users = await getAllConnections();
    const connections = users.map((user) => user.connectionId);

    // Send game update to all other users (except the caller or the game creator)
    const promises = connections.map((otherConnectionId) => {
      if (otherConnectionId !== callerConnectionId) {
        const jsonWsResponse = JSON.stringify(createGameUpdateResponse(updatedGame, state));
        return ws.send(jsonWsResponse, otherConnectionId);
      }

      // Do nothing
      return null;
    });

    await Promise.all(promises);
  }

  return updatedGame;
};
