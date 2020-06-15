import { Handler } from 'aws-lambda';
import { addUserToGame } from '../module/db';
import { WebSocketAPIGatewayEvent, LambdaEventBody, LambdaResponse, LambdaEventBodyPayloadOptions } from '../types';
import { response } from '../utils/response';
import { Logger } from '../utils/Logger';
import { WebSocketClient } from '../WebSocketClient';
import { successWebSocketResponse, failedWebSocketResponse, createJoinGameResponse } from '../utils/webSocketActions';
import { broadcastJoinGameMessage } from '../utils/broadcast';

/**
 * Handler for joining a game.
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  // Logger
  Logger.createLogTitle('onJoinGame.ts');

  // Parse event
  const { connectionId } = event.requestContext;
  const body: LambdaEventBody = JSON.parse(event.body);
  const { payload }: { payload: LambdaEventBodyPayloadOptions } = body;
  const gameId = payload.gameId as string;

  // Join game
  console.log('Updating a game in the db table...');
  const ws = new WebSocketClient(event.requestContext);
  try {
    // Send success response
    const updatedGame = await addUserToGame(gameId, connectionId);
    console.log('Updated game:', updatedGame);
    const res = createJoinGameResponse(updatedGame);
    const updatedGameResponse = successWebSocketResponse(res);
    await ws.send(JSON.stringify(updatedGameResponse), connectionId);

    // Send message to other users in the game
    await broadcastJoinGameMessage(ws, gameId, connectionId);

    return response(200, 'Joined game successfully');
  } catch (err) {
    console.error(err);

    // Send failure response
    const emptyGameResponse = createJoinGameResponse(undefined);
    const res = failedWebSocketResponse(emptyGameResponse, err);
    await ws.send(JSON.stringify(res), connectionId);

    return response(500, err);
  }
};
