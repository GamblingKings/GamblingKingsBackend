import { HongKongWall } from '../games/mahjong/Wall/version/HongKongWall';

export interface GameState {
  gameId: string;
  wall: HongKongWall;
  hands: UserHand[];
  currentIndex: number;
}

export interface UserHand {
  connectionId: string;
  hand: string;
}
