import { Handler } from 'aws-lambda';
import { LambdaEventBody, WebSocketAPIGatewayEvent } from '../../types/event';
import { WebSocketClient } from '../../websocket/WebSocketClient';
import { Logger } from '../../utils/Logger';
import { response } from '../../utils/responseHelper';
import { LambdaResponse } from '../../types/response';
import { getGameByGameId } from '../../dynamodb/gameDBService';

/**
 * Handler for interacting with a tile.
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  Logger.createLogTitle('onWinRound.ts');
  const body: LambdaEventBody = JSON.parse(event.body);
  console.log('body', body);
  const ws = new WebSocketClient(event.requestContext);

  try {
    return response(200, 'Tile drawn from wall successfully');
  } catch (err) {
    console.error(JSON.stringify(err));
    return response(500, 'Failed to draw a tile');
  }
};
