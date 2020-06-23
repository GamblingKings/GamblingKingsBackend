import { HongKongWall } from '../module/mahjong/Wall/version/HongKongWall';

export interface GameState {
  gameId: string;
  wall: HongKongWall;
  hands: UserHand[];
}

export interface UserHand {
  connectionId: string;
  hand: string;
}
