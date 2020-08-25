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
import { getConnectionIdsFromUsers, sleep } from '../../utils/broadcastHelper';
import { response } from '../../utils/responseHelper';
import { LambdaResponse } from '../../types/response';
import { HandPointResults, TileObjects } from '../../games/mahjong/types/MahjongTypes';

/**
 * Convert handPointResults.tiles from TileObjects[] to string[].
 * @param {HandPointResults} handPointResults
 */
export const parseHandPointResults = (handPointResults: HandPointResults): HandPointResults => {
  const updatedHandPointResults = handPointResults;
  const tiles = handPointResults.tiles as TileObjects[];
  updatedHandPointResults.tiles = tiles.map((tileStringDefinition: TileObjects) => {
    if (tileStringDefinition.value === -1) return tileStringDefinition.type;
    return `${tileStringDefinition.value}_${tileStringDefinition.type}`;
  });

  return updatedHandPointResults;
};

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
  const handPointResults = parseHandPointResults(payload.handPointResults as HandPointResults);
  const ws = new WebSocketClient(event.requestContext);

  /**
   * The WIN_ROUND lambda will do the following:
   * 1. Send WINNING_TILES to all users with points and the winning tiles
   * 2. Update the the GameState with new wall/hands/dealer/wind
   * 3. Send UPDATE_GAME_STATE to all users with the updated dealer/wind
   * 4. Delay 5s and send GAME_START to all users to start off a new game
   */
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

    // Start a new round and update the dealer/wind
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

    // Send GAME_START to start a new round and send new hands to users
    await sleep(5000); // Delay 5s before sending GAME_START to client
    await broadcastGameReset(ws, connectionIds, updatedGameState);

    return response(200, 'New round started successfully');
  } catch (err) {
    console.error(JSON.stringify(err));
    return response(500, 'Failed to start a new round');
  }
};
