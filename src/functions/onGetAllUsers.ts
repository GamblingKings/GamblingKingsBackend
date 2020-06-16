import { Handler } from 'aws-lambda';
import { LambdaResponse, UserStates, WebSocketAPIGatewayEvent } from '../types';
import { response } from '../utils/response';
import { WebSocketClient } from '../WebSocketClient';
import { broadcastConnections, broadcastUserUpdate } from '../utils/broadcast';
import { Logger } from '../utils/Logger';
import { User } from '../models/User';

/**
 * Handler for getting all the users (or connections).
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  Logger.createLogTitle('onGetAlUsers.ts');

  console.log('RequestContext', event.requestContext);
  const { connectionId } = event.requestContext;
  const ws = new WebSocketClient(event.requestContext);

  console.log('Getting all users...');
  try {
    // Send all users to the caller
    const res: User[] = await broadcastConnections(ws, connectionId);

    // Broadcast the updated users list to all the other users in the game
    const connectionIds = res.map((user) => user.connectionId);
    await broadcastUserUpdate(ws, connectionId, UserStates.CONNECT, connectionIds);

    return response(200, res.toString());
  } catch (err) {
    console.error(err);
    return response(500, err);
  }
};
