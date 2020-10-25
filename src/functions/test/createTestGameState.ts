import { Handler } from 'aws-lambda';
import { LambdaEventBody, WebSocketAPIGatewayEvent } from '../../types/event';
import { LambdaResponse } from '../../types/response';
import { response } from '../../utils/responseHelper';
import { Logger } from '../../utils/Logger';
import { getUsersInGame } from '../../dynamodb/gameDBService';
import { getConnectionIdsFromUsers } from '../../utils/broadcastHelper';
import { initGameState } from '../../dynamodb/gameStateDBService';
import { User } from '../../models/User';
import { WebSocketClient } from '../../websocket/WebSocketClient';
import { GameState } from '../../models/GameState';
import { testReplaceGameState } from '../../../__test__/dynamodb/dbTestHelpers';
import { createTestGameStateResponse } from '../../websocket/createWSResponse';
import { LambdaEventBodyPayloadOptions } from '../../types/payload';

/**
 * For testing: need to create a game and add 3 other users in the game in advance, then this
 * lambda will create a new game state and overwrite with any game state you want for testing purposes.
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  Logger.createLogTitle('createTestGameState.ts.ts');

  // Parse event
  const body: LambdaEventBody = JSON.parse(event.body);
  const { payload }: { payload: LambdaEventBodyPayloadOptions } = body;
  const gameId = payload.gameId as string;

  const ws = new WebSocketClient(event.requestContext);
  try {
    const users = (await getUsersInGame(gameId)) as User[];
    const connectionIds = getConnectionIdsFromUsers(users);

    // Create a new game state
    await initGameState(gameId, connectionIds);

    // Replace this with any game state you want to test
    const testGameState: GameState = {
      gameId,
      wall: ['1_DOT', '2_DOT'],
      hands: [
        {
          connectionId: connectionIds[0],
          hand: ['1_DOT'],
          playedTiles: ['1_SEASON'],
        },
        {
          connectionId: connectionIds[1],
          hand: ['2_DOT'],
          playedTiles: ['2_SEASON'],
        },
        {
          connectionId: connectionIds[2],
          hand: ['3_DOT'],
          playedTiles: ['3_SEASON'],
        },
        {
          connectionId: connectionIds[3],
          hand: ['4_DOT'],
          playedTiles: ['4_SEASON'],
        },
      ],
      dealer: 0,
      currentIndex: 53,
      currentWind: 0,
      currentTurn: 0,
      playedTileInteractions: [],
      interactionCount: 0,
    };
    const result = (await testReplaceGameState(testGameState)) as GameState;
    await Promise.all(connectionIds.map((cid) => ws.send(createTestGameStateResponse({ gameState: result }), cid)));
    return response(200, 'Added test game state successfully');
  } catch (err) {
    return response(500, err);
  }
};
