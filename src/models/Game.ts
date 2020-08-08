import { User } from './User';
import { HasVersion } from './Version';

/**
 * Game interface representing Games table schema
 */
export interface Game extends HasVersion {
  readonly gameId: string;
  host: User;
  users: User[];
  gameLoadedCount: number;
  gameName?: string;
  gameType?: string;
  gameVersion?: string;
  state?: string;
  started?: boolean;
}
