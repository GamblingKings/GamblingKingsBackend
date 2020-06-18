import { Handler } from 'aws-lambda';
import { response } from '../utils/responseHelper';
import { WebSocketClient } from '../WebSocketClient';
import { broadcastGames } from '../utils/broadcast';
import { Logger } from '../utils/Logger';
import { WebSocketAPIGatewayEvent } from '../types/event';
import { LambdaResponse } from '../types/response';

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
    return response(200, JSON.stringify(res));
  } catch (err) {
    console.error(err);
    return response(500, err);
  }
};
