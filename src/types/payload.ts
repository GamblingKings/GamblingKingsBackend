import { Game } from '../models/Game';
import { User } from '../models/User';
import { GameStatesEnum, UserStatesEnum } from '../enums/states';
import { SelfPlayedTile } from '../models/GameState';

/* ----------------------------------------------------------------------------
 * WebSocket Payload
 * ------------------------------------------------------------------------- */

/**
 * Payload interface for Lambda event body
 */
export interface LambdaEventBodyPayloadOptions {
  connectionId?: string;
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
  tiles?: string[];
  tile?: string;
  playedTiles?: string[];
  meldType?: string;
  skipInteraction?: boolean;
  dealer?: number;
  wind?: number;
}

export interface UserUpdatePayload {
  user: User;
  state: UserStatesEnum;
}

export interface GetAllUsersPayload {
  users: User[];
}

export interface CreateGamePayload {
  game: Game;
}

export interface GameUpdatePayload {
  game: Game;
  state: GameStatesEnum;
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
  tiles: string[];
  selfPlayedTiles: SelfPlayedTile[];
  currentIndex: number;
}

export interface DrawTilePayload {
  tile: string;
}

export interface PlayTilePayload {
  connectionId: string;
  tile: string;
}

export interface PlayedTileInteractionPayload {
  playedTiles: string[];
  meldType: string;
  skipInteraction: boolean;
}

export interface InteractionSuccessPayload {
  playedTiles: string[];
  meldType: string;
  skipInteraction: boolean;
}

export interface WinningTilesPayload {
  connectionId: string;
  tiles: string[];
}

export interface UpdateGameStatePayload {
  dealer: number;
  wind: number;
}

export interface SelfPlayTilePayload {
  connectionId: string;
  playedTile: string;
  isQuad: boolean;
  alreadyMeld: boolean;
}
