import { WebSocketClient } from '../WebSocketClient';
import { getAllConnections, getAllGames, getGameByGameId, getUserByConnectionId } from '../module/db';
import { User } from '../models/User';
import { Game } from '../models/Game';
import {
  createWSAllUsersResponse,
  createWSMessageResponse,
  createWSAllGamesResponse,
  createUserUpdateResponse,
  createGameUpdateResponse,
} from './webSocketActions';

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
 * @param {string} msg a message as a string of array
 */
export const broadcastMessage = async (ws: WebSocketClient, msg: string): Promise<User[] | []> => {
  const users: User[] = await getAllConnections();

  if (users && users.length > 0) {
    // Create message response object
    const jsonWsResponse = JSON.stringify(createWSMessageResponse(msg));

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
 */
export const broadcastJoinGameMessage = async (
  ws: WebSocketClient,
  gameId: string,
  connectionId: string,
): Promise<User | undefined> => {
  const game = await getGameByGameId(gameId);
  let users: User[] = [];
  let user;

  if (game) {
    users = game.users;
    const otherConnections = users.filter((connection) => connection.connectionId !== connectionId);

    // Get joining user's username
    user = await getUserByConnectionId(connectionId);

    if (user) {
      const { username } = user;

      // Format message
      const msg = `${username || connectionId} just joined the game.`;
      const jsonWsResponse = JSON.stringify(createWSMessageResponse(msg));

      // Send message to the other connections that are already in the game
      await Promise.all(
        otherConnections.map((connection) => {
          return ws.send(jsonWsResponse, connection.connectionId);
        }),
      );
    }
  }

  return user || undefined;
};

export const broadcastUserUpdate = async (
  ws: WebSocketClient,
  connectionId: string,
  state: string,
): Promise<User | undefined> => {
  const updatedUser = await getUserByConnectionId(connectionId);

  if (updatedUser) {
    const jsonWsResponse = JSON.stringify(createUserUpdateResponse(updatedUser, state));
    await ws.send(jsonWsResponse, connectionId);
  }

  return updatedUser;
};

export const broadcastGameUpdate = async (
  ws: WebSocketClient,
  gameId: string,
  state: string,
): Promise<Game | undefined> => {
  const updatedGame = await getGameByGameId(gameId);

  if (updatedGame) {
    const { users } = updatedGame;

    const promises = users.map((user) => {
      const jsonWsResponse = JSON.stringify(createGameUpdateResponse(updatedGame, state));
      return ws.send(jsonWsResponse, user.connectionId);
    });

    await Promise.all(promises);
  }

  return updatedGame;
};
