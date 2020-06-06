import { Handler } from 'aws-lambda';
import { WebSocketAPIGatewayEvent, LambdaEventBody, LambdaResponse } from '../types';
import { response } from '../utils/response';
import { WebSocketClient } from '../WebSocketClient';
import { broadcastMessage } from '../utils/broadcast';

/**
 * Handler for sending a message to all the users (or connections).
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  console.log('RequestContext', event.requestContext);
  const ws = new WebSocketClient(event.requestContext);
  const body: LambdaEventBody = JSON.parse(event.body);

  // Broadcast message
  console.log(body);
  console.log(body.payload);
  const { message } = body.payload;

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
