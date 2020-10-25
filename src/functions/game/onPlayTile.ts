import { Handler } from 'aws-lambda';
import { LambdaEventBody, WebSocketAPIGatewayEvent } from '../../types/event';
import { LambdaResponse } from '../../types/response';
import { Logger } from '../../utils/Logger';
import { LambdaEventBodyPayloadOptions } from '../../types/payload';
import { WebSocketClient } from '../../websocket/WebSocketClient';
import { response } from '../../utils/responseHelper';
import { broadcastPlayedTileToUsers } from '../../websocket/broadcast/gameBroadcast';
import { getGameByGameId } from '../../dynamodb/gameDBService';
import { getConnectionIdsFromUsers } from '../../utils/broadcastHelper';

/**
 * Handler for drawing a tile from the mahjong wall.
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  Logger.createLogTitle('onPlayTile.ts');

  // Parse event
  const { connectionId } = event.requestContext;
  const body: LambdaEventBody = JSON.parse(event.body);
  const { payload }: { payload: LambdaEventBodyPayloadOptions } = body;
  const gameId = payload.gameId as string;
  const tile = payload.tile as string;

  const ws = new WebSocketClient(event.requestContext);
  try {
    let connectionIds: string[] = [];

    // Get all the users in a game
    const game = await getGameByGameId(gameId);
    if (game) {
      connectionIds = getConnectionIdsFromUsers(game.users);
    }

    // Send the tile that is played by a user
    await broadcastPlayedTileToUsers(ws, tile, connectionId, connectionIds);

    return response(200, 'Tile discarded successfully');
  } catch (err) {
    return response(500, 'Failed to discard a tile');
  }
};
