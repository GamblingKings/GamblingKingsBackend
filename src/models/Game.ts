import { User } from './User';
import { HasVersion } from './Version';

/**
 * Game interface
 */
export interface Game extends HasVersion {
  readonly gameId: string;
  host: User;
  users: User[];
  readyCount: number;
  gameName?: string;
  gameType?: string;
  gameVersion?: string;
  state?: string;
  started?: boolean;
}
