import { Handler } from 'aws-lambda';
import { WebSocketAPIGatewayEvent, LambdaResponse } from '../types';
import { WebSocketClient } from '../WebSocketClient';
import { Logger } from '../utils/Logger';
import { response } from '../utils/response';

/**
 * Handler for update the game
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  Logger.createLogTitle('onGameUpdate.ts');

  console.log('RequestContext', event.requestContext);
  const ws = new WebSocketClient(event.requestContext);
  return response(200, 'Updated game info successfully');
};
