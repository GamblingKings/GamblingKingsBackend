import { Handler } from 'aws-lambda';
import { LambdaEventBody, WebSocketAPIGatewayEvent } from '../../types/event';
import { LambdaResponse } from '../../types/response';
import { response } from '../../utils/responseHelper';
import { Logger } from '../../utils/Logger';
import { InteractionSuccessPayload, LambdaEventBodyPayloadOptions } from '../../types/payload';
import { WebSocketClient } from '../../websocket/WebSocketClient';
import {
  createPlayedTileInteractionResponse,
  failedWebSocketResponse,
  successWebSocketResponse,
} from '../../websocket/createWSResponse';
import { MeldEnum } from '../../enums/MeldEnum';
import {
  getCurrentPlayedTile,
  getInteractionCount,
  resetPlayedTileInteraction,
  setPlayedTileInteraction,
} from '../../dynamodb/gameStateDBService';
import { GameState, PlayedTile } from '../../models/GameState';
import { DEFAULT_MAX_USERS_IN_GAME } from '../../utils/constants';
import { getConnectionIdsFromUsers } from '../../utils/broadcastHelper';
import { getUsersInGame } from '../../dynamodb/gameDBService';
import { User } from '../../models/User';
import { broadcastInteractionSuccess } from '../../websocket/broadcast/gameStateBroadcast';

/**
 * Compare played tile interaction and decide whose can make meld base on meld priority.
 * Send message to all user in the game about who can take the played tile.
 * @param {string} gameId Game Id
 * @param {WebSocketClient} ws WebSocketClient
 */
export const compareTileInteractionAndSendUpdate = async (gameId: string, ws: WebSocketClient): Promise<void> => {
  const users = (await getUsersInGame(gameId)) as User[];
  const connectionIds = getConnectionIdsFromUsers(users);

  const playedTileInteractions = (await getCurrentPlayedTile(gameId)) as PlayedTile[];
  const interactions: PlayedTile[] = playedTileInteractions.filter((playedTileInteraction) => {
    return !playedTileInteraction.skipInteraction;
  });

  // If there are 3 skips (empty interactions array),
  // send message with skipInteraction: true to client
  if (interactions.length === 0) {
    await broadcastInteractionSuccess(
      ws,
      {
        meldType: '',
        playedTiles: [],
        skipInteraction: true,
      },
      connectionIds,
    );
    return;
  }

  let messageSent = false;
  let connectionId: string;
  let numOfConsecutive = 0;
  interactions.forEach((i): unknown => {
    const { connectionId: cid, playedTiles: tile, meldType: meld } = i;

    const wsPayload: InteractionSuccessPayload = {
      connectionId: cid,
      meldType: meld,
      playedTiles: tile,
      skipInteraction: false,
    };

    /**
     * Making Triplet or Quad (Triplet and Quad takes precedence over Consecutive)
     */
    if (!messageSent && (meld === MeldEnum.TRIPLET || meld === MeldEnum.QUAD)) {
      messageSent = true;
      return broadcastInteractionSuccess(ws, wsPayload, connectionIds);
    }

    /**
     * Making Consecutive
     */
    // Only one user (the next user to the user who played the tile) can make consecutive
    if (meld === MeldEnum.CONSECUTIVE) {
      numOfConsecutive += 1;
      connectionId = cid;
    }

    // If no one make a Triplet or Quad, then a user can make consecutive if there is any
    if (!messageSent && meld === MeldEnum.CONSECUTIVE && numOfConsecutive === 1) {
      const newWsPayload = {
        ...wsPayload,
        connectionId,
      };
      return broadcastInteractionSuccess(ws, newWsPayload, connectionIds);
    }

    return wsPayload;
  });
};

/**
 * Handler for interacting with a tile.
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  Logger.createLogTitle('onPlayedTileInteraction.ts');

  // Parse event
  const { connectionId } = event.requestContext;
  const body: LambdaEventBody = JSON.parse(event.body);
  const { payload }: { payload: LambdaEventBodyPayloadOptions } = body;
  const gameId = payload.gameId as string;
  const playedTiles = payload.playedTiles as string[];
  const meldType = payload.meldType as string;
  const skipInteraction = payload.skipInteraction as boolean;

  console.log('Incrementing interaction count and decide which meld type takes priority');
  const ws = new WebSocketClient(event.requestContext);
  const playedTileResponse = { playedTiles, meldType, skipInteraction };
  const playedTileInteractionResponse = createPlayedTileInteractionResponse(playedTileResponse);
  try {
    // Get current interaction count
    const interactionCount = (await getInteractionCount(gameId)) as number;

    // Run setPlayedTileInteraction when interaction count is less than 4
    let newGameState: GameState;
    let newInteractionCount = 0;
    if (interactionCount < DEFAULT_MAX_USERS_IN_GAME - 1) {
      newGameState = (await setPlayedTileInteraction(
        gameId,
        connectionId,
        playedTiles,
        meldType,
        skipInteraction,
      )) as GameState;
      newInteractionCount = newGameState.interactionCount as number;
      await ws.send(successWebSocketResponse(playedTileInteractionResponse), connectionId);
    }

    // Compare meld type and send message based on priority
    console.log('newInteractionCount:', newInteractionCount);
    let interactionEnded = false;
    if (newInteractionCount === 3) {
      interactionEnded = true;
      await compareTileInteractionAndSendUpdate(gameId, ws);
    }

    // Reset interactionCount to be 0 and playedTile list to empty
    if (interactionEnded) {
      await resetPlayedTileInteraction(gameId);
    }

    return response(200, 'Tile interaction is successful');
  } catch (err) {
    console.error(JSON.stringify(err));
    await ws.send(failedWebSocketResponse(playedTileInteractionResponse, err), connectionId);
    return response(500, err);
  }
};
