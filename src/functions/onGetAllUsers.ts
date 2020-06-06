import { Handler } from 'aws-lambda';
import { WebSocketAPIGatewayEvent, LambdaResponse } from '../types';
import { response } from '../utils/response';
import { WebSocketClient } from '../WebSocketClient';
import { broadcastConnections } from '../utils/broadcast';
import { Logger } from '../utils/Logger';

/**
 * Handler for getting all the users (or connections).
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  Logger.createLogTitle(__filename);

  console.log('RequestContext', event.requestContext);
  const ws = new WebSocketClient(event.requestContext);

  console.log('Getting all users...');
  try {
    const res = await broadcastConnections(ws, event.requestContext.connectionId);
    return response(200, res.toString());
  } catch (err) {
    console.error(err);
    return response(500, err);
  }
};
