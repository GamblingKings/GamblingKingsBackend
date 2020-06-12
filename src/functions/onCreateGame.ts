import { Handler } from 'aws-lambda';
import { createGame } from '../module/db';
import { WebSocketAPIGatewayEvent, LambdaEventBody, LambdaResponse, LambdaEventBodyPayloadOptions } from '../types';
import { response } from '../utils/response';
import { Logger } from '../utils/Logger';
import { WebSocketClient } from '../WebSocketClient';
import { createGameResponse, successWebSocketResponse, failedWebSocketResponse } from '../utils/webSocketActions';
import { Game } from '../models/Game';

/**
 * Handler for creating a game.
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  Logger.createLogTitle('onCreateGame.ts');

  const { connectionId } = event.requestContext;
  const body: LambdaEventBody = JSON.parse(event.body);
  const { payload }: { payload: LambdaEventBodyPayloadOptions } = body;
  const { game } = payload;

  console.log('Payload data', game);
  console.log('Type of payload data', typeof game);

  console.log('Adding game to the db table...');

  const ws = new WebSocketClient(event.requestContext);
  try {
    if (!game) {
      // Send failed response
      const gameResponse = failedWebSocketResponse('Games attribute cannot be empty');
      ws.send(JSON.stringify(gameResponse), connectionId);

      return response(400, 'Games attribute cannot be empty');
    }

    // Create game
    const { gameName, gameType, gameVersion } = game;
    const returnedGameObj: Game = await createGame(connectionId, gameName, gameType, gameVersion);

    // Send success response
    const res = createGameResponse(returnedGameObj);
    const jsonWsResponse = JSON.stringify(successWebSocketResponse(res));
    ws.send(jsonWsResponse, connectionId);

    return response(200, 'Game created successfully');
  } catch (err) {
    // Send failed response
    const jsonWsResponse = JSON.stringify(failedWebSocketResponse(err));
    ws.send(jsonWsResponse, connectionId);
    console.error(err);
    return response(500, err);
  }
};
