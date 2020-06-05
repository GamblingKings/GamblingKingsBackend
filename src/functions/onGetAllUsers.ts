// eslint-disable-next-line import/no-unresolved
import { Handler } from 'aws-lambda';
import { WebSocketAPIGatewayEvent, LambdaEventBody } from '../types';
import { response, LambdaResponse } from '../utils/response';
import { WebSocketClient } from '../WebSocketClient';
import { broadcast } from '../utils/broadcast';

export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  const ws = new WebSocketClient(event.requestContext);
  const body: LambdaEventBody = JSON.parse(event.body);

  // Testing broadcast messages
  console.log(body);
  console.log(body.payload);
  const { data } = body.payload;

  try {
    const res = await broadcast(ws, data);
    return response(200, res.toString());
  } catch (err) {
    console.error(err);
    return response(500, err);
  }
};
