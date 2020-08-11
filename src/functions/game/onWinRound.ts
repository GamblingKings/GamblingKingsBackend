import { Handler } from 'aws-lambda';
import { LambdaEventBody, WebSocketAPIGatewayEvent } from '../../types/event';
import { WebSocketClient } from '../../websocket/WebSocketClient';
import { Logger } from '../../utils/Logger';
import { response } from '../../utils/responseHelper';
import { LambdaResponse } from '../../types/response';
import { LambdaEventBodyPayloadOptions } from '../../types/payload';
import { getGameStateByGameId, changeDealer } from '../../dynamodb/gameStateDBService';
import { getUsersInGame } from '../../dynamodb/gameDBService';
// import { broadcastWinningTiles } from '../../websocket/broadcast/gameStateBroadcast';
/**
 * Handler for interacting with a tile.
 * @param {WebSocketAPIGatewayEvent} event Websocket API gateway event
 */
export const handler: Handler = async (event: WebSocketAPIGatewayEvent): Promise<LambdaResponse> => {
  Logger.createLogTitle('onWinRound.ts');

  // Parse event
  const { connectionId } = event.requestContext;
  const body: LambdaEventBody = JSON.parse(event.body);
  const { payload }: { payload: LambdaEventBodyPayloadOptions } = body;
  const gameId = payload.gameId as string;
  const winningTiles = JSON.parse(payload.tiles as string);
  const ws = new WebSocketClient(event.requestContext);

  // {action: "WIN_ROUND", payload: {
  //   gameId: adfjas135151361346
  //   tiles: ['tile1', 'tile2'],
  //   points: 123412 // currently not implemented in frontend
  //   connectionId: 12351235123515
  // }}

  // get users from game table

  // get the gameid, tiles, from the payload, and grab the current game session from dynamodb
  // compare the dealer with the connectionId(winner)
  // if dealer is different, increment the dealer counter
  // if dealer counter resets to 0, change wind

  // send a web_socket payload {action: 'WINNING_TILES', payload: {
  //   tiles: ['']
  // }}

  // send a web_socket payload
  // {
  //    action: 'UPDATE_GAME_STATE,
  //    payload: { some state, i.e. dealer, wind }}

  // wait 5 seconds before starting new round and sending {action: 'GAME_START', payload: { new tiles}} to all connections

  try {
    // broadcastConnections(ws, )
    const gameState = await getGameStateByGameId(gameId, ['dealer', 'users']);
    // const users = await getUsersInGame(gameId);

    // if (gameState.Item.users[gameState.Item.dealer].connectionId === connectionId) {
    //   changeDealer(gameId)
    // }

    console.log('gamestate', gameState);
    // console.log('users', users);
    return response(200, 'Tile drawn from wall successfully');
  } catch (err) {
    console.error(JSON.stringify(err));
    return response(500, 'Failed to draw a tile');
  }
};
