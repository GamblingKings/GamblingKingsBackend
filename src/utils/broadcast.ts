import { WebSocketClient } from '../WebSocketClient';
import { getAllConnections, getAllGames } from '../module/db';
import { User } from '../models/User';
import { Game } from '../models/Game';
import { createWSAllUsersResponse, createWSMessageResponse, createWSAllGamesResponse } from './webSocketActions';

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

    // Send all the active connections to all the users
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
