/**
 * File to store types used in Mahjong classes
 */

import { SimpleTileTypes } from '../Tile/types/SimpleTileTypes';
import { HonorTileTypes } from '../Tile/types/HonorTileTypes';
import { BonusTileTypes } from '../Tile/types/BonusTileTypes';
import { WindEnum } from '../../../enums/WindEnum';
import { Tile } from '../Tile/Tile';
import { MeldEnum } from '../../../enums/MeldEnum';

export interface TileDefinition {
  type: SimpleTileTypes | HonorTileTypes | BonusTileTypes;
  value: number;
}

export interface Meld {
  tiles: string[];
  type: MeldEnum;
}

export interface HandDefinition {
  points: number;
  name: string;
}

export interface TileObject {
  type: string;
  value: number;
}

export interface HandPointResults {
  totalPoints: number;
  handPoints: number;
  extraPoints: number;
  windPoints: number;
  dragonPoints: number;
  flowerPoints: number;
  concealedPoint: number;
  hands: HandDefinition[];
  tiles: Tile[] | TileObject[] | string[];
  bonusTiles: Tile[];
  wind: WindEnum;
  flower: number;
  melds?: Meld[];
}

/**
 * Initial mahjong hand type used for HongKong mahjong
 */
export interface HongKongMahjongHand {
  hand: string[];
  bonusTiles: string[];
}
