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
  playedTileInteractions?: PlayedTile[];
  interactionCount?: number;
}

export interface PlayedTile {
  playedTiles: string[];
  meldType: string;
  connectionId: string;
  skipInteraction: boolean;
}

/**
 * UserHand interface
 */
export interface UserHand {
  connectionId: string;
  hand: string[];
}
