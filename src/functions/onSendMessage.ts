import { Handler } from 'aws-lambda';
import { response } from '../utils/responseHelper';
import { WebSocketClient } from '../WebSocketClient';
import { broadcastMessage } from '../utils/broadcast';
import { Logger } from '../utils/Logger';
import { LambdaEventBody, WebSocketAPIGatewayEvent } from '../types/event';
import { LambdaEventBodyPayloadOptions } from '../types/payload';
import { LambdaResponse } from '../types/response';

/**
 * Handler for sending a message to all the users (or connections).
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  Logger.createLogTitle('onSendMessage.ts');

  console.log('RequestContext', event.requestContext);
  const ws = new WebSocketClient(event.requestContext);
  const body = JSON.parse(event.body) as LambdaEventBody;
  const { payload }: { payload: LambdaEventBodyPayloadOptions } = body;

  // Broadcast message
  console.log(body);
  console.log(payload);
  const { username, message } = payload;

  try {
    if (username && message) {
      const res = await broadcastMessage(ws, username, message);
      return response(200, JSON.stringify(res));
    }

    return response(400, 'Message attribute cannot be empty');
  } catch (err) {
    console.error(err);
    return response(500, err);
  }
};
