import { Handler } from 'aws-lambda';
import { WebSocketAPIGatewayEvent, LambdaEventBody } from '../types';
import { response, LambdaResponse } from '../utils/response';
import { WebSocketClient } from '../WebSocketClient';
import { broadcastGames } from '../utils/broadcast';

export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  console.log('RequestContext', event.requestContext);
  const ws = new WebSocketClient(event.requestContext);

  try {
    const res = await broadcastGames(ws);
    return response(200, res.toString());
  } catch (err) {
    console.error(err);
    return response(500, err);
  }
};
