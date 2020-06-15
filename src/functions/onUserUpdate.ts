import { Handler } from 'aws-lambda';
import { WebSocketAPIGatewayEvent, LambdaResponse } from '../types';
import { WebSocketClient } from '../WebSocketClient';
import { Logger } from '../utils/Logger';
import { response } from '../utils/response';

/**
 * Handler for update a user
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  // TODO: Implement this route
  Logger.createLogTitle('onUserUpdate.ts');

  console.log('RequestContext', event.requestContext);
  const ws = new WebSocketClient(event.requestContext);
  return response(200, 'Updated user info successfully');
};
