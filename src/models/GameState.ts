export interface GameState {
  gameId: string;
  wall: string[];
  hands: UserHand[];
  currentIndex: number;
}

export interface UserHand {
  connectionId: string;
  hand: string[];
}
