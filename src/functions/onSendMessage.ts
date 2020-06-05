import { Handler } from 'aws-lambda';
import { WebSocketAPIGatewayEvent, LambdaEventBody } from '../types';
import { response, LambdaResponse } from '../utils/response';
import { WebSocketClient } from '../WebSocketClient';
import { broadcastMessage } from '../utils/broadcast';

export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  console.log('RequestContext', event.requestContext);
  const ws = new WebSocketClient(event.requestContext);
  const body: LambdaEventBody<string> = JSON.parse(event.body);

  // Testing broadcast messages
  console.log(body);
  console.log(body.payload);
  const { data } = body.payload;

  try {
    const res = await broadcastMessage(ws, data);
    return response(200, res.toString());
  } catch (err) {
    console.error(err);
    return response(500, err);
  }
};
