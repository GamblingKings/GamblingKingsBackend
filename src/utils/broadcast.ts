import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { WebSocketClient } from '../WebSocketClient';
import { getAllConnections, getAllGames } from '../module/db';
import { User } from '../models/User';
import { Game } from '../models/Game';
import { createWSAllUsersResponse, createWSMessageResponse, createWSAllGamesResponse } from './websocket_actions';

/**
 * Broadcast all the connections to all users.
 * @param {WebSocketClient} ws a WebSocketClient instance
 */
export const broadcastConnections = async (ws: WebSocketClient): Promise<DocumentClient.ItemList | []> => {
  const userItems = (await getAllConnections()).Items;

  if (userItems && userItems.length > 0) {
    // Get a list of users
    const users: User[] = userItems.map((connection) => {
      return {
        connectionId: connection.connectionId,
        username: connection.username,
      };
    });
    console.log('Connections:', users);
    console.log('Type of Connections:', typeof users);

    // Create users response object
    const jsonWsResponse = createWSAllUsersResponse(users);

    // Send all the active connections to all the users
    await Promise.all(
      userItems.map((connection) => {
        // Send all connections to all users
        return ws.send(jsonWsResponse, connection.connectionId);
      }),
    );
  }

  return userItems || [];
};

/**
 * Broadcast a message to all users.
 * @param {WebSocketClient} ws a WebSocketClient instance
 * @param {string} msg a message as a string of array
 */
export const broadcastMessage = async (ws: WebSocketClient, msg: string): Promise<DocumentClient.ItemList | []> => {
  const userItems = (await getAllConnections()).Items;

  if (userItems && userItems.length > 0) {
    // Create message response object
    const jsonWsResponse = createWSMessageResponse(msg);

    // Send all the active connections to all the users
    await Promise.all(
      userItems.map((connection) => {
        // Send all connections to all users
        return ws.send(jsonWsResponse, connection.connectionId);
      }),
    );
  }

  return userItems || [];
};

/**
 * Broadcast all the currently active games to all users.
 * @param {WebSocketClient} ws a WebSocketClient instance
 */
export const broadcastGames = async (ws: WebSocketClient): Promise<DocumentClient.ItemList | []> => {
  const userItems = (await getAllConnections()).Items;
  const gameItems = (await getAllGames()).Items;
  let games: Game[];

  if (userItems && userItems.length > 0) {
    // Send all the games info to all the users
    const promises = userItems.map((connection) => {
      // Make games an empty array if gameItems are empty
      if (gameItems) {
        games = gameItems.map((game) => {
          const { gameId, users, gameName, gameType, gameVersion } = game;
          return {
            gameId,
            users,
            gameName,
            gameType,
            gameVersion,
          };
        });
      } else {
        games = [];
      }
      console.log('Games:', games);

      // Create games response object
      const jsonWsResponse = createWSAllGamesResponse(games);

      // Send all games each user
      return ws.send(jsonWsResponse, connection.connectionId);
    });

    await Promise.all(promises);
  }

  return gameItems || [];
};
