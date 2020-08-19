import { Handler } from 'aws-lambda';
import { LambdaEventBody, WebSocketAPIGatewayEvent } from '../../types/event';
import { WebSocketClient } from '../../websocket/WebSocketClient';
import { Logger } from '../../utils/Logger';
import { LambdaEventBodyPayloadOptions } from '../../types/payload';
import { getCurrentDealer, startNewGameRound } from '../../dynamodb/gameStateDBService';
import { getUsersInGame } from '../../dynamodb/gameDBService';
import { User } from '../../models/User';
import {
  broadcastWinningTiles,
  broadcastUpdateGameState,
  broadcastGameReset,
} from '../../websocket/broadcast/gameBroadcast';
import { getConnectionIdsFromUsers } from '../../utils/broadcastHelper';
import { response } from '../../utils/responseHelper';
import { LambdaResponse } from '../../types/response';

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
  const winningTiles = (payload.tiles as unknown) as string[];
  const ws = new WebSocketClient(event.requestContext);

  try {
    // TODO: Deal with errors if gameid is invalid
    const gameState = await Promise.all([getCurrentDealer(gameId), getUsersInGame(gameId)]);
    const dealer = gameState[0] as number;
    const users = gameState[1] as User[];
    const connectionIds = getConnectionIdsFromUsers(users);

    // send winning tiles to all connections
    await broadcastWinningTiles(ws, connectionIds, connectionId, winningTiles);

    const updatedGameState = await startNewGameRound(
      gameId,
      connectionIds,
      users[dealer].connectionId !== connectionId, // change dealer if winner is not currently a dealer
    );

    if (!updatedGameState) throw Error('cannot start new game round');

    // send current dealer and wind to all connections
    await broadcastUpdateGameState(ws, connectionIds, updatedGameState.dealer, updatedGameState.currentWind);

    // start new round and send new hands to user
    setTimeout(async () => {
      await broadcastGameReset(ws, connectionIds, updatedGameState);
    }, 5000);

    return response(200, 'New round started successfully');
  } catch (err) {
    console.error(JSON.stringify(err));
    return response(500, 'Failed to start a new round');
  }
};
