import { Handler } from 'aws-lambda';
import { deleteConnection } from '../module/db';
import { WebSocketAPIGatewayEvent, LambdaResponse, UserStates } from '../types';
import { response } from '../utils/response';
import { Logger } from '../utils/Logger';
import { broadcastUserUpdate } from '../utils/broadcast';
import { WebSocketClient } from '../WebSocketClient';

/**
 * Handler for websocket disconnect.
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  Logger.createLogTitle('onDisconnect.ts');

  const { connectionId } = event.requestContext;

  console.log('Deleting connectionId from the db table...');
  const ws = new WebSocketClient(event.requestContext);
  try {
    // Delete user from ConnectionsTable
    await deleteConnection(connectionId);

    // Send user update with state
    await broadcastUserUpdate(ws, connectionId, UserStates.DISCONNECT);

    return response(200, 'Connection deleted successfully');
  } catch (err) {
    console.error(err);
    return response(500, err);
  }
};
