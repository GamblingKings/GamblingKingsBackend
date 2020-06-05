import { Handler } from 'aws-lambda';
import { WebSocketAPIGatewayEvent, LambdaResponse } from '../types';
import { response } from '../utils/response';
import { WebSocketClient } from '../WebSocketClient';
import { broadcastGames } from '../utils/broadcast';

/**
 * Handler for getting all the games.
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  console.log('RequestContext', event.requestContext);
  const ws = new WebSocketClient(event.requestContext);

  console.log('Getting all games...');
  try {
    const res = await broadcastGames(ws);
    return response(200, res.toString());
  } catch (err) {
    console.error(err);
    return response(500, err);
  }
};
