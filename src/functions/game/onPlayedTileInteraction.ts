// import { Handler } from 'aws-lambda';
// import { LambdaEventBody, WebSocketAPIGatewayEvent } from '../../types/event';
// import { LambdaResponse } from '../../types/response';
// import { response } from '../../utils/responseHelper';
// import { Logger } from '../../utils/Logger';
// import { LambdaEventBodyPayloadOptions } from '../../types/payload';
// import { WebSocketClient } from '../../websocket/WebSocketClient';
// import {
//   createPlayedTileInteractionResponse,
//   failedWebSocketResponse,
//   successWebSocketResponse,
// } from '../../websocket/createWSResponse';
// import { broadcastGameStart } from '../../websocket/broadcast/gameBroadcast';
// import { MeldEnum } from '../../enums/MeldEnum';
// import { getGameStateByGameId, incrementPlayedTileInteractionCount } from '../../dynamodb/gameStateDBService';
// import { GameState, PlayedTile } from '../../models/GameState';
//
// export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
//   Logger.createLogTitle('onPlayedTileInteraction.ts');
//
//   // Parse event
//   const { connectionId } = event.requestContext;
//   const body: LambdaEventBody = JSON.parse(event.body);
//   const { payload }: { payload: LambdaEventBodyPayloadOptions } = body;
//   const gameId = payload.gameId as string;
//   const playedTileStr = payload.playedTile as string;
//   const meldType = payload.meldType as string;
//
//   console.log('Incrementing interaction count and decide which meld type takes priority');
//   let gameState: GameState;
//   const ws = new WebSocketClient(event.requestContext);
//   try {
//     // Get current interaction count
//     const currentGameState = (await getGameStateByGameId(gameId)) as GameState;
//     const { interactionCount, playedTile: currentPlayedTile } = currentGameState;
//     const { playedTile: currentPlayedTileStr, possibleMeld, skip } = currentPlayedTile as PlayedTile;
//     if (currentPlayedTileStr === playedTileStr) {
//       if (possibleMeld === MeldEnum.CONSECUTIVE || possibleMeld === MeldEnum.QUAD) {
//         // Response
//         const playedTileResponse = { playedTile: playedTileStr, meldType };
//         const playedTileInteractionResponse = createPlayedTileInteractionResponse(playedTileResponse);
//
//         // Increment interaction count
//         gameState = (await incrementPlayedTileInteractionCount(gameId, playedTileStr, meldType)) as GameState;
//         await ws.send(successWebSocketResponse(playedTileInteractionResponse), connectionId);
//       }
//     }
//   } catch (err) {
//     console.error(JSON.stringify(err));
//     await ws.send(failedWebSocketResponse(gamePageLoadResponse, err), connectionId);
//     return response(500, err);
//   }
//
//   const { host, users, gameLoadedCount } = game;
//   try {
//     // Start game if 4 users' game page has been loaded
//     // TODO: can probably add user ready logic to this
//     if (gameLoadedCount === 4) {
//       await broadcastGameStart(ws, gameId, host.connectionId, users);
//       return response(200, 'Game started (after game page loaded) successfully');
//     }
//
//     console.log(`${gameLoadedCount} users' game page has been loaded, waiting for ${4 - gameLoadedCount} user(s)`);
//
//     return response(200, 'User ready count incremented successfully');
//   } catch (err) {
//     console.log(JSON.stringify(err));
//     return response(500, err);
//   }
// };
