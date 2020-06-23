import { Handler } from 'aws-lambda';
import { LambdaEventBody, WebSocketAPIGatewayEvent } from '../types/event';
import { LambdaResponse } from '../types/response';
import { response } from '../utils/responseHelper';
import { Logger } from '../utils/Logger';
import { LambdaEventBodyPayloadOptions } from '../types/payload';
import { incrementGameLoadedCount } from '../module/dynamodb/gameDBService';
import { WebSocketClient } from '../WebSocketClient';
import { broadcastGameStart } from '../utils/broadcast';

export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  Logger.createLogTitle('onGamePageLoad.ts');

  // Parse event
  const body: LambdaEventBody = JSON.parse(event.body);
  const { payload }: { payload: LambdaEventBodyPayloadOptions } = body;
  const gameId = payload.gameId as string;

  console.log('Incrementing ready count and preparing to start a game...');
  const ws = new WebSocketClient(event.requestContext);
  try {
    // Increment user ready count
    const res = await incrementGameLoadedCount(gameId);

    if (res) {
      const { users, gameLoadedCount } = res;

      // Start game if 4 users' game page has been loaded
      // TODO: can probably add user ready logic to this
      if (gameLoadedCount === 4) {
        await broadcastGameStart(ws, users);
      } else {
        console.log(`${gameLoadedCount} users' game page has been loaded, waiting for ${4 - gameLoadedCount} user(s)`);
      }
    }

    return response(200, 'User ready count incremented successfully');
  } catch (err) {
    console.error(JSON.stringify(err));
    return response(500, err);
  }
};
