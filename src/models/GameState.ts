/**
 * GameState interface representing GameState table schema
 */
export interface GameState {
  readonly gameId: string;
  wall: string[];
  hands: UserHand[];
  dealer: number;
  currentIndex: number;
  currentWind: number;
  currentTurn: number;
  playedTile?: PlayedTile[];
  interactionCount?: number;
}

export interface PlayedTile {
  playedTile: string;
  possibleMeld: string | undefined;
  connectionId: string;
  skip: boolean;
}

/**
 * UserHand interface
 */
export interface UserHand {
  connectionId: string;
  hand: string[];
}
