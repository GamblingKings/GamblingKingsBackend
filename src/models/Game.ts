/**
 * Game interface
 */
export interface Game {
  gameId: string;
  users: string[];
  gameName?: string;
  gameType?: string;
  gameVersion?: string;
}
