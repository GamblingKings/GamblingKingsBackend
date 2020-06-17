import { Handler } from 'aws-lambda';
import { WebSocketAPIGatewayEvent, LambdaResponse } from '../types';
import { response } from '../utils/response';
import { WebSocketClient } from '../WebSocketClient';
import { broadcastGames } from '../utils/broadcast';
import { Logger } from '../utils/Logger';

/**
 * Handler for getting all the games.
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  Logger.createLogTitle('onGetAllGames.ts');

  console.log('RequestContext', event.requestContext);
  const ws = new WebSocketClient(event.requestContext);

  console.log('Getting all games...');
  try {
    const res = await broadcastGames(ws, event.requestContext.connectionId);
    return response(200, res.toString());
  } catch (err) {
    console.error(err);
    return response(500, err);
  }
};
