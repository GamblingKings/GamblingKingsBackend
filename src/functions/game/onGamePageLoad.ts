import { Handler } from 'aws-lambda';
import { LambdaEventBody, WebSocketAPIGatewayEvent } from '../../types/event';
import { LambdaResponse } from '../../types/response';
import { response } from '../../utils/responseHelper';
import { Logger } from '../../utils/Logger';
import { LambdaEventBodyPayloadOptions } from '../../types/payload';
import { incrementGameLoadedCount } from '../../dynamodb/gameDBService';
import { WebSocketClient } from '../../websocket/WebSocketClient';
import {
  createGamePageLoadResponse,
  failedWebSocketResponse,
  successWebSocketResponse,
} from '../../websocket/createWSResponse';
import { Game } from '../../models/Game';
import { broadcastGameStart } from '../../websocket/broadcast/gameBroadcast';

export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  Logger.createLogTitle('onGamePageLoad.ts');

  // Parse event
  const { connectionId } = event.requestContext;
  const body: LambdaEventBody = JSON.parse(event.body);
  const { payload }: { payload: LambdaEventBodyPayloadOptions } = body;
  const gameId = payload.gameId as string;

  console.log('Incrementing ready count and preparing to start a game...');
  let game: Game;
  const ws = new WebSocketClient(event.requestContext);
  const gamePageLoadResponse = createGamePageLoadResponse();
  try {
    // Increment user ready count
    game = (await incrementGameLoadedCount(gameId)) as Game;
    await ws.send(successWebSocketResponse(gamePageLoadResponse), connectionId);
  } catch (err) {
    console.error(JSON.stringify(err));
    await ws.send(failedWebSocketResponse(gamePageLoadResponse, err), connectionId);
    return response(500, err);
  }

  const { host, users, gameLoadedCount } = game;
  try {
    // Start game if 4 users' game page has been loaded
    // TODO: can probably add user ready logic to this
    if (gameLoadedCount === 4) {
      await broadcastGameStart(ws, gameId, users);
      return response(200, 'Game started (after game page loaded) successfully');
    }

    console.log(`${gameLoadedCount} users' game page has been loaded, waiting for ${4 - gameLoadedCount} user(s)`);

    return response(200, 'User ready count incremented successfully');
  } catch (err) {
    console.log(JSON.stringify(err));
    return response(500, err);
  }
};
