import { User } from './User';
import { HasVersion } from './Version';

/**
 * Game interface
 */
export interface Game extends HasVersion {
  gameId: string;
  host: User;
  users: User[];
  gameName?: string;
  gameType?: string;
  gameVersion?: string;
  state?: string;
  started?: boolean;
}
