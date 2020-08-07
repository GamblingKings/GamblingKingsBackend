import { Handler } from 'aws-lambda';
import { LambdaEventBody, WebSocketAPIGatewayEvent } from '../../types/event';
import { LambdaResponse } from '../../types/response';
import { response } from '../../utils/responseHelper';
import { Logger } from '../../utils/Logger';
import { InteractionSuccessPayload, LambdaEventBodyPayloadOptions } from '../../types/payload';
import { WebSocketClient } from '../../websocket/WebSocketClient';
import {
  createInteractionSuccessResponse,
  createPlayedTileInteractionResponse,
  failedWebSocketResponse,
  successWebSocketResponse,
} from '../../websocket/createWSResponse';
import { MeldEnum } from '../../enums/MeldEnum';
import { getCurrentPlayedTile, getInteractionCount, setPlayedTileInteraction } from '../../dynamodb/gameStateDBService';
import { GameState, PlayedTile } from '../../models/GameState';
import { DEFAULT_MAX_USERS_IN_GAME } from '../../utils/constants';
import { getConnectionIdsFromUsers } from '../../utils/broadcastHelper';
import { getUsersInGame } from '../../dynamodb/gameDBService';
import { User } from '../../models/User';

/**
 * Compare played tile interaction and decide whose can make meld base on meld priority.
 * Send message to all user in the game about who can take the played tile.
 * @param {string} gameId Game Id
 * @param {WebSocketClient} ws WebSocketClient
 */
export const compareTileInteractionAndSendUpdate = async (gameId: string, ws: WebSocketClient): Promise<void> => {
  const users = (await getUsersInGame(gameId)) as User[];
  const connectionIds = getConnectionIdsFromUsers(users);
  const playedTileInteractionList = (await getCurrentPlayedTile(gameId)) as PlayedTile[];
  const interactions: PlayedTile[] = playedTileInteractionList.filter((playedTileInteraction) => {
    return !playedTileInteraction.skip;
  });

  let messageSent = false;
  let connectionId: string;
  let numOfConsecutive = 0;
  interactions.forEach((i): unknown => {
    const { connectionId: cid, playedTile: tile } = i;
    const meld = i.possibleMeld as string;

    const wsPayload: InteractionSuccessPayload = {
      connectionId: cid,
      meldType: meld,
      playedTile: tile,
    };

    /**
     * Making Triplet or Quad (Triplet and Quad takes precedence over Consecutive)
     */
    if (!messageSent && (meld === MeldEnum.TRIPLET || meld === MeldEnum.QUAD)) {
      messageSent = true;
      const successWsResponse = createInteractionSuccessResponse(wsPayload);
      return Promise.all(connectionIds.map((user) => ws.send(successWsResponse, user)));
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
      const msg = createInteractionSuccessResponse({
        ...wsPayload,
        connectionId,
      });
      return Promise.all(connectionIds.map((user) => ws.send(msg, user)));
    }

    return wsPayload;
  });
};

export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  Logger.createLogTitle('onPlayedTileInteraction.ts');

  // Parse event
  const { connectionId } = event.requestContext;
  const body: LambdaEventBody = JSON.parse(event.body);
  const { payload }: { payload: LambdaEventBodyPayloadOptions } = body;
  const gameId = payload.gameId as string;
  const playedTile = payload.playedTile as string;
  const meldType = payload.meldType as string;
  const skipInteraction = payload.skipInteraction as boolean;

  console.log('Incrementing interaction count and decide which meld type takes priority');
  const ws = new WebSocketClient(event.requestContext);
  const playedTileResponse = { playedTile, meldType, skipInteraction };
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
        playedTile,
        meldType,
        skipInteraction,
      )) as GameState;
      newInteractionCount = newGameState.interactionCount as number;
      await ws.send(successWebSocketResponse(playedTileInteractionResponse), connectionId);
    }

    // Compare meld type and send message based on priority
    console.log('newInteractionCount:', newInteractionCount);
    if (newInteractionCount === 3) {
      await compareTileInteractionAndSendUpdate(gameId, ws);
    }

    return response(200, 'Tile interaction is successful');
  } catch (err) {
    console.error(JSON.stringify(err));
    await ws.send(failedWebSocketResponse(playedTileInteractionResponse, err), connectionId);
    return response(500, err);
  }
};
