import { Handler } from 'aws-lambda';
import { LambdaEventBody, WebSocketAPIGatewayEvent } from '../types/event';
import { LambdaResponse, WebSocketResponse } from '../types/response';
import { response } from '../utils/responseHelper';
import { Logger } from '../utils/Logger';
import { startGame } from '../module/gameDBService';
import { LambdaEventBodyPayloadOptions } from '../types/payload';
import { WebSocketClient } from '../WebSocketClient';
import { createStartGameResponse, successWebSocketResponse, failedWebSocketResponse } from '../utils/createWSResponse';

const REQUIRED_NUMBER_OF_USERS = 4;

/**
 * Handler for starting a new game.
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
    const updatedGame = await startGame(gameId, connectionId);

    if (updatedGame) {
      const { users } = updatedGame;
      const connectionsInGame = users.map((user) => user.connectionId);

      // Check if the game has enough users to get started
      if (!connectionsInGame || connectionsInGame.length < REQUIRED_NUMBER_OF_USERS) {
        throw new Error(`Require ${REQUIRED_NUMBER_OF_USERS} users to start the game.`);
      }

      // Send start game message to users in the game
      await Promise.all(
        connectionsInGame.map((connection) => {
          const res: WebSocketResponse = successWebSocketResponse(emptyGameResponse);
          return ws.send(res, connectionId);
        }),
      );
    }

    return response(200, 'Game started successfully');
  } catch (err) {
    console.error(JSON.stringify(err));

    // Send failure messag
    const res: WebSocketResponse = failedWebSocketResponse(emptyGameResponse, JSON.stringify(err));
    await ws.send(res, connectionId);

    return response(500, 'Failed to start the game');
  }
};
