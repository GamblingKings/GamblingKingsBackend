import { Handler } from 'aws-lambda';
import { LambdaEventBody, WebSocketAPIGatewayEvent } from '../../types/event';
import { LambdaResponse } from '../../types/response';
import { Logger } from '../../utils/Logger';
import { LambdaEventBodyPayloadOptions, SelfPlayTilePayload } from '../../types/payload';
import { WebSocketClient } from '../../websocket/WebSocketClient';
import { response } from '../../utils/responseHelper';
import { broadcastSelfPlayTile } from '../../websocket/broadcast/gameBroadcast';
import { getUsersInGame } from '../../dynamodb/gameDBService';
import { getConnectionIdsFromUsers } from '../../utils/broadcastHelper';

/**
 * Handler for self playing tiles (flowers, seasons, or quad).
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  Logger.createLogTitle('onSelfPlayTile.ts.ts');

  // Parse event
  const { connectionId } = event.requestContext;
  const body: LambdaEventBody = JSON.parse(event.body);
  const { payload }: { payload: LambdaEventBodyPayloadOptions } = body;
  const gameId = payload.gameId as string;
  const playedTile = payload.playedTile as string;
  const isQuad = payload.isQuad as boolean;
  const alreadyMeld = payload.alreadyMeld as boolean;

  console.log(`User with connection Id ${connectionId} ran SELF_PLAY_TILE route...`);
  const ws = new WebSocketClient(event.requestContext);
  try {
    let connectionIds: string[] = [];

    // Get all the users in a game
    const users = await getUsersInGame(gameId);

    if (!users) {
      console.error('Failed to get users in game');
      return response(400, 'Failed to get users in game');
    }

    // Send self play tile response to all users in game
    connectionIds = getConnectionIdsFromUsers(users);
    const wsPayload: SelfPlayTilePayload = {
      connectionId,
      playedTile,
      isQuad: isQuad || false,
      alreadyMeld: alreadyMeld || false,
    };
    await broadcastSelfPlayTile(ws, connectionIds, wsPayload);

    return response(200, 'Self play tile function is run successfully');
  } catch (err) {
    console.error(JSON.stringify(err));

    return response(500, 'Failed to run self play tile function');
  }
};
