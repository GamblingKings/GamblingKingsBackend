import { User } from './User';

/**
 * Game interface
 */
export interface Game {
  gameId: string;
  host: User;
  users: User[];
  gameName?: string;
  gameType?: string;
  gameVersion?: string;
  state?: string;
  started?: boolean;
}
