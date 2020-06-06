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
  const wsPayload: LambdaEventBodyPayloadOptions = {
    message,
  };
  const wsResponse = createWSResponse(WebSocketActions.SEND_MESSAGE, wsPayload);
  return JSON.stringify(wsResponse);
};

export const createWSAllUsersResponse = (users: User[]): string => {
  // Create message response object
  const wsPayload: LambdaEventBodyPayloadOptions = {
    users,
  };
  const wsResponse = createWSResponse(WebSocketActions.SEND_MESSAGE, wsPayload);
  return JSON.stringify(wsResponse);
};

export const createWSAllGamesResponse = (games: Game[]): string => {
  // Create message response object
  console.log(games);
  const wsPayload: LambdaEventBodyPayloadOptions = {
    games,
  };
  const wsResponse = createWSResponse(WebSocketActions.SEND_MESSAGE, wsPayload);
  return JSON.stringify(wsResponse);
};
