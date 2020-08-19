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
import { GameState } from '../../models/GameState';

/**
 * Handler for Winning Round
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<void> => {
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

    const updatedGameState = (await startNewGameRound(
      gameId,
      connectionIds,
      users[dealer].connectionId !== connectionId, // change dealer if winner is not currently a dealer
    )) as GameState;

    // send current dealer and wind to all connections
    await broadcastUpdateGameState(ws, connectionIds, updatedGameState.dealer, updatedGameState.currentWind);

    // start new round and send new hands to user
    setTimeout(async () => {
      await broadcastGameReset(ws, connectionIds, updatedGameState);
    }, 5000);
  } catch (err) {
    console.error(JSON.stringify(err));
  }
};
