import { Handler } from 'aws-lambda';
import { createGame } from '../module/db';
import { WebSocketAPIGatewayEvent, LambdaEventBody, LambdaResponse } from '../types';
import { response } from '../utils/response';

/**
 * Handler for creating a game.
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  const body: LambdaEventBody = JSON.parse(event.body);
  const { payload } = body;
  const { game } = payload;
  console.log('Payload data', game);
  console.log('Type of payload data', typeof game);

  console.log('Adding game to the db table...');
  try {
    if (game) {
      const { gameName, gameType, gameVersion } = game;
      await createGame(event.requestContext.connectionId, gameName, gameType, gameVersion);
    } else {
      return response(400, 'Games attribute cannot be empty');
    }

    return response(200, 'Game created successfully');
  } catch (err) {
    console.error(err);
    return response(500, err);
  }
};
