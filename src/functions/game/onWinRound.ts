import { Handler } from 'aws-lambda';
import { LambdaEventBody, WebSocketAPIGatewayEvent } from '../../types/event';
import { WebSocketClient } from '../../websocket/WebSocketClient';
import { Logger } from '../../utils/Logger';
import { LambdaEventBodyPayloadOptions } from '../../types/payload';
import { changeDealer, getCurrentDealer, getCurrentWind } from '../../dynamodb/gameStateDBService';
import { getUsersInGame } from '../../dynamodb/gameDBService';
import { User } from '../../models/User';
import {
  broadcastWinningTiles,
  broadcastUpdateGameState,
  broadcastGameStart,
  broadcastGameReset,
} from '../../websocket/broadcast/gameBroadcast';

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
    const connectionIds = users.map((user) => user.connectionId);

    // send winning tiles to all connections
    await broadcastWinningTiles(ws, connectionIds, connectionId, winningTiles);

    if (users[dealer].connectionId !== connectionId) {
      await changeDealer(gameId);
    }

    // get Updated dealer and Wind
    const updatedGameState = await Promise.all([getCurrentDealer(gameId), getCurrentWind(gameId)]);
    const updatedDealer = updatedGameState[0] as number;
    const updatedWind = updatedGameState[1] as number;

    // send current dealer and wind to all connections
    await broadcastUpdateGameState(ws, connectionIds, updatedDealer, updatedWind);

    // start new round and send new hands to user
    setTimeout(async () => {
      await broadcastGameReset(ws, gameId, users);
    }, 5000);
  } catch (err) {
    console.error(JSON.stringify(err));
  }
};
