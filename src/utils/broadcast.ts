import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { WebSocketClient } from '../WebSocketClient';
import { getAllConnections } from '../module/db';

export const broadcast = async (ws: WebSocketClient, msg: string): Promise<DocumentClient.ItemList | []> => {
  const { Items } = await getAllConnections();
  let connections: string[];
  if (Items && Items.length > 0) {
    connections = Items.map((connection) => connection.connectionId);
    console.log('Connections:', connections);
    console.log('Type of Connections:', typeof connections);
    Items.map((connection) => ws.send(msg, connection.connectionId));
    Items.map((connection) => ws.send(connections.toString(), connection.connectionId));
    return Items;
  }
  return [];
};
