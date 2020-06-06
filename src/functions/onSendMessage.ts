import { Handler } from 'aws-lambda';
import { WebSocketAPIGatewayEvent, LambdaEventBody, LambdaResponse, LambdaEventBodyPayloadOptions } from '../types';
import { response } from '../utils/response';
import { WebSocketClient } from '../WebSocketClient';
import { broadcastMessage } from '../utils/broadcast';
import { Logger } from '../utils/Logger';

/**
 * Handler for sending a message to all the users (or connections).
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  Logger.createLogTitle(__filename);

  console.log('RequestContext', event.requestContext);
  const ws = new WebSocketClient(event.requestContext);
  const body = JSON.parse(event.body) as LambdaEventBody;
  const { payload }: { payload: LambdaEventBodyPayloadOptions } = body;

  // Broadcast message
  console.log(body);
  console.log(payload);
  const { message } = payload;

  try {
    if (message) {
      const res = await broadcastMessage(ws, message);
      return response(200, res.toString());
    }

    return response(400, 'Message attribute cannot be empty');
  } catch (err) {
    console.error(err);
    return response(500, err);
  }
};
