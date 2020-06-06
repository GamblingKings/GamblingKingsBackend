import { LambdaEventBodyPayloadOptions, WebSocketResponse, WebSocketActions } from '../types';
import { User } from '../models/User';
import { Game } from '../models/Game';

export const createWSResponse = (
  action: WebSocketActions,
  payload: LambdaEventBodyPayloadOptions,
): WebSocketResponse => {
  return {
    action,
    payload,
  };
};

export const createWSMessageResponse = (message: string): string => {
  // Create message response object
  const wsPayload = { message } as LambdaEventBodyPayloadOptions;
  const wsResponse = createWSResponse(WebSocketActions.SEND_MESSAGE, wsPayload);
  return JSON.stringify(wsResponse);
};

export const createWSAllUsersResponse = (users: User[]): string => {
  // Create get all users response object
  const wsPayload = { users } as LambdaEventBodyPayloadOptions;
  const wsResponse = createWSResponse(WebSocketActions.GET_ALL_USERS, wsPayload);
  return JSON.stringify(wsResponse);
};

export const createWSAllGamesResponse = (games: Game[]): string => {
  // Create get all games response object
  console.log(games);
  const wsPayload = { games } as LambdaEventBodyPayloadOptions;
  const wsResponse = createWSResponse(WebSocketActions.GET_ALL_GAMES, wsPayload);
  return JSON.stringify(wsResponse);
};
