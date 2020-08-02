import { Handler } from 'aws-lambda';
import { response } from '../utils/responseHelper';
import { WebSocketClient } from '../websocket/WebSocketClient';
import { Logger } from '../utils/Logger';
import { User } from '../models/User';
import { WebSocketAPIGatewayEvent } from '../types/event';
import { LambdaResponse } from '../types/response';
import { UserStatesEnum } from '../enums/states';
import { broadcastConnections, broadcastUserUpdate } from '../websocket/broadcast/userBroadcast';
import { getConnectionIdsFromUsers } from '../utils/broadcastHelper';

/**
 * Handler for getting all the users (or connections).
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  Logger.createLogTitle('onGetAlUsers.ts');

  const { connectionId } = event.requestContext;

  console.log('Getting all users...');
  const ws = new WebSocketClient(event.requestContext);
  try {
    // Send all users to the caller
    const res: User[] = await broadcastConnections(ws, connectionId);

    // Broadcast the updated users list to all the other users in the game
    const connectionIds = getConnectionIdsFromUsers(res);
    await broadcastUserUpdate(ws, connectionId, UserStatesEnum.CONNECTED, connectionIds);

    return response(200, JSON.stringify(res));
  } catch (err) {
    console.error(JSON.stringify(err));
    return response(500, err);
  }
};
