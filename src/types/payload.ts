import { Game } from '../models/Game';
import { User } from '../models/User';
import { GameStates, UserStates } from '../enums/states';

/* ----------------------------------------------------------------------------
 * WebSocket Payload
 * ------------------------------------------------------------------------- */

/**
 * Payload interface for Lambda event body
 */
export interface LambdaEventBodyPayloadOptions {
  username?: string;
  message?: string;
  user?: User;
  game?: Game;
  gameId?: string;
  users?: User[];
  games?: Game[];
  success?: boolean;
  error?: string;
  state?: string;
  time?: string;
  tiles?: string;
  tile?: string;
}

export interface UserUpdatePayload {
  user: User;
  state: UserStates;
}

export interface GetAllUsersPayload {
  users: User[];
}

export interface CreateGamePayload {
  game: Game;
}

export interface GameUpdatePayload {
  game: Game;
  state: GameStates;
}

export interface GetAllGamesPayload {
  games: Game[];
}

export interface JoinGamePayload {
  game: Game;
}

export interface LeaveGamePayload {
  game: Game;
}

export interface InGameUpdatePayload {
  users: User[];
}

export interface InGameMessagePayload {
  username: string;
  message: string;
  time?: string;
}

export interface SendMessagePayload {
  username: string;
  message: string;
}

export interface GameStartPayload {
  tiles: string;
}

export interface DrawTilePayload {
  tile: string;
}

export interface PlayTilePayload {
  tile: string;
}
