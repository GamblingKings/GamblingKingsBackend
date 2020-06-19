import { Handler } from 'aws-lambda';
import { LambdaEventBody, WebSocketAPIGatewayEvent } from '../types/event';
import { LambdaResponse, WebSocketResponse } from '../types/response';
import { response } from '../utils/responseHelper';
import { Logger } from '../utils/Logger';
import { startGame } from '../module/gameDBService';
import { LambdaEventBodyPayloadOptions } from '../types/payload';
import { WebSocketClient } from '../WebSocketClient';
import { createStartGameResponse, successWebSocketResponse, failedWebSocketResponse } from '../utils/createWSResponse';

/**
 * Handler for setting username for a user (or connection).
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  Logger.createLogTitle('onStartGame.ts');

  // Parse event
  const { connectionId } = event.requestContext;
  const body: LambdaEventBody = JSON.parse(event.body);
  const { payload }: { payload: LambdaEventBodyPayloadOptions } = body;
  const gameId = payload.gameId as string;

  console.log('Starting a game...');
  const ws = new WebSocketClient(event.requestContext);
  const emptyGameResponse = createStartGameResponse();
  try {
    // Start game
    await startGame(gameId);

    // Send success message
    const res: WebSocketResponse = successWebSocketResponse(emptyGameResponse);
    await ws.send(JSON.stringify(res), connectionId);

    return response(200, 'Game started successfully');
  } catch (err) {
    console.error(err);

    // Send failure messag
    const res: WebSocketResponse = failedWebSocketResponse(emptyGameResponse, err);
    await ws.send(JSON.stringify(res), connectionId);

    return response(500, 'Failed to start the game');
  }
};
