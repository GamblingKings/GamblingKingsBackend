import { User } from './User';

/**
 * Game interface
 */
export interface Game {
  gameId: string;
  users: User[];
  gameName?: string;
  gameType?: string;
  gameVersion?: string;
  started?: boolean;
}
