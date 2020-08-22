import { Handler } from 'aws-lambda';
import { LambdaEventBody, WebSocketAPIGatewayEvent } from '../../types/event';
import { WebSocketClient } from '../../websocket/WebSocketClient';
import { Logger } from '../../utils/Logger';
import { LambdaEventBodyPayloadOptions } from '../../types/payload';
import { getCurrentDealer, startNewGameRound } from '../../dynamodb/gameStateDBService';
import { getUsersInGame } from '../../dynamodb/gameDBService';
import {
  broadcastGameReset,
  broadcastUpdateGameState,
  broadcastWinningTiles,
} from '../../websocket/broadcast/gameBroadcast';
import { getConnectionIdsFromUsers } from '../../utils/broadcastHelper';
import { response } from '../../utils/responseHelper';
import { LambdaResponse } from '../../types/response';
import { HandPointResults } from '../../games/mahjong/types/MahjongTypes';

/**
 * Handler for Winning Round
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  Logger.createLogTitle('onWinRound.ts');

  const { connectionId } = event.requestContext;
  const body: LambdaEventBody = JSON.parse(event.body);
  const { payload }: { payload: LambdaEventBodyPayloadOptions } = body;
  const gameId = payload.gameId as string;
  const handPointResults = payload.handPointResults as HandPointResults;
  const ws = new WebSocketClient(event.requestContext);

  try {
    // Find dealer and users from game state by game Id
    const dealer = await getCurrentDealer(gameId);
    if (dealer === undefined || !dealer.toString()) {
      const errorMsg = `Cannot find dealer in game state by gameId ${gameId}`;
      console.error(errorMsg);
      return response(400, errorMsg);
    }

    const users = await getUsersInGame(gameId);
    if (!users || users.length === 0) {
      const errorMsg = `Cannot find users in game state by gameId ${gameId}`;
      console.error(errorMsg);
      return response(400, errorMsg);
    }

    const connectionIds = getConnectionIdsFromUsers(users);

    // Send WINNING_TILES response to all connections
    await broadcastWinningTiles(ws, connectionIds, connectionId, handPointResults);

    // Start new round
    const updatedGameState = await startNewGameRound(
      gameId,
      connectionIds,
      users[dealer].connectionId !== connectionId, // change dealer if winner is not currently a dealer
    );
    if (!updatedGameState) {
      console.error('Cannot start new game round');
      return response(400, 'Cannot start new game round');
    }

    // Send UPDATE_GAME_STATE with current dealer and wind to all connections
    const { dealer: newDealer, currentWind } = updatedGameState;
    await broadcastUpdateGameState(ws, connectionIds, newDealer, currentWind);

    // Send GAME_START to start new round and send new hands to users
    setTimeout(async () => {
      await broadcastGameReset(ws, connectionIds, updatedGameState);
    }, 5000); // Delay 5s before sending GAME_START to client

    return response(200, 'New round started successfully');
  } catch (err) {
    console.error(JSON.stringify(err));
    return response(500, 'Failed to start a new round');
  }
};
