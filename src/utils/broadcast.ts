import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { WebSocketClient } from '../WebSocketClient';
import { getAllConnections, getAllGames } from '../module/db';

/**
 * Broadcast all the connections to all users.
 * @param {WebSocketClient} ws a WebSocketClient instance
 * @param {string | string[]} msg a message as a string of array. This param is optional.
 */
export const broadcastConnections = async (
  ws: WebSocketClient,
  msg?: string | string[],
): Promise<DocumentClient.ItemList | []> => {
  const { Items } = await getAllConnections();
  let connections: string[];

  if (Items && Items.length > 0) {
    connections = Items.map((connection) => connection.connectionId);
    console.log('Connections:', connections);
    console.log('Type of Connections:', typeof connections);

    await Promise.all(
      Items.map((connection) => {
        if (msg) {
          // Send custom message to users
          return ws.send(msg.toString(), connection.connectionId);
        }

        // Send all connections to all users
        return ws.send(connections, connection.connectionId);
      }),
    );

    return Items;
  }

  return [];
};

/**
 * Broadcast a message to all users.
 * @param {WebSocketClient} ws a WebSocketClient instance
 * @param {string | string[]} msg a message as a string of array
 */
export const broadcastMessage = async (
  ws: WebSocketClient,
  msg: string | string,
): Promise<DocumentClient.ItemList | []> => {
  return broadcastConnections(ws, msg);
};

/**
 * Broadcast all the currently active games to all users.
 * @param {WebSocketClient} ws a WebSocketClient instance
 */
export const broadcastGames = async (ws: WebSocketClient): Promise<DocumentClient.ItemList | []> => {
  const userItems = (await getAllConnections()).Items;
  const gameItems = (await getAllGames()).Items;
  let connections: string[];
  let games: string[];

  if (userItems && userItems.length > 0) {
    connections = userItems.map((connection) => connection.connectionId);
    console.log('Connections:', connections);
    console.log('Type of Connections:', typeof connections);

    await Promise.all(
      userItems.map((connection) => {
        if (gameItems && gameItems.length > 0) {
          games = gameItems.map((game) => game.gameId);
          console.log('Games:', games);

          // Send all games to all users
          return ws.send(games && games.length > 0 ? games : [], connection.connectionId);
        }
      }),
    );
  }

  return gameItems || [];
};
