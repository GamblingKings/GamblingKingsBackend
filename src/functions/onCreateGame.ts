import { Handler } from 'aws-lambda';
import { createGame } from '../module/db';
import { WebSocketAPIGatewayEvent, LambdaEventBody, LambdaResponse, LambdaEventBodyPayloadOptions } from '../types';
import { response } from '../utils/response';
import { Logger } from '../utils/Logger';
import { WebSocketClient } from '../WebSocketClient';
import { createGameResponse } from '../utils/webSocketActions';

/**
 * Handler for creating a game.
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  console.log('FILENAME:', __filename);
  Logger.createLogTitle(__filename);

  const { connectionId } = event.requestContext;
  const body: LambdaEventBody = JSON.parse(event.body);
  const { payload }: { payload: LambdaEventBodyPayloadOptions } = body;
  const { game } = payload;

  console.log('Payload data', game);
  console.log('Type of payload data', typeof game);

  console.log('Adding game to the db table...');

  const ws = new WebSocketClient(event.requestContext);
  const res = createGameResponse(game);
  try {
    if (!game) {
      // Send failed response
      const gameResponse = { success: false, ...res };
      ws.send(JSON.stringify(gameResponse), connectionId);

      return response(400, 'Games attribute cannot be empty');
    }

    // Create game
    const { gameName, gameType, gameVersion } = game;
    await createGame(connectionId, gameName, gameType, gameVersion);

    // Send success response
    const gameResponse = { success: true, ...res };
    ws.send(JSON.stringify(gameResponse), connectionId);

    return response(200, 'Game created successfully');
  } catch (err) {
    // Send failed response
    const gameResponse = { success: false, ...res };
    ws.send(JSON.stringify(gameResponse), connectionId);
    console.error(err);
    return response(500, err);
  }
};
