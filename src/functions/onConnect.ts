import { Handler } from 'aws-lambda';
import { saveConnection } from '../module/db';
import { WebSocketAPIGatewayEvent, LambdaResponse, UserStates } from '../types';
import { response } from '../utils/response';
import { Logger } from '../utils/Logger';
import { broadcastUserUpdate } from '../utils/broadcast';
import { WebSocketClient } from '../WebSocketClient';

/**
 * Handler for websocket connection.
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  Logger.createLogTitle('onConnect.ts');

  const { connectionId } = event.requestContext;

  console.log('Writing connectionId to the db table...');
  const ws = new WebSocketClient(event.requestContext);
  try {
    // Add user to ConnectionsTable
    await saveConnection(connectionId);

    // Send user update with state
    await broadcastUserUpdate(ws, connectionId, UserStates.CONNECT);

    return response(200, 'Connection added successfully');
  } catch (err) {
    console.error(err);
    return response(500, err);
  }
};
