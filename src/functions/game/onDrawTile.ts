import { Handler } from 'aws-lambda';
import { LambdaEventBody, WebSocketAPIGatewayEvent } from '../../types/event';
import { LambdaResponse } from '../../types/response';
import { Logger } from '../../utils/Logger';
import { LambdaEventBodyPayloadOptions } from '../../types/payload';
import { WebSocketClient } from '../../websocket/WebSocketClient';
import { response } from '../../utils/responseHelper';
import { broadcastDrawTileToUser } from '../../websocket/broadcast/gameBroadcast';

/**
 * Handler for drawing a tile from the mahjong wall.
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  Logger.createLogTitle('onDrawTile.ts');

  // Parse event
  const { connectionId } = event.requestContext;
  const body: LambdaEventBody = JSON.parse(event.body);
  const { payload }: { payload: LambdaEventBodyPayloadOptions } = body;
  const gameId = payload.gameId as string;

  console.log('Drawing a tile...');
  const ws = new WebSocketClient(event.requestContext);
  try {
    await broadcastDrawTileToUser(ws, gameId, connectionId);
    return response(200, 'Tile drawn from wall successfully');
  } catch (err) {
    console.error(JSON.stringify(err));

    return response(500, 'Failed to draw a tile');
  }
};
