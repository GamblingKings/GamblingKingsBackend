/**
 * The Tiles class represents a single Tiles used in Mahjong.
 * There are different types of tiles which can be categorized
 * as simple (dots, bamboo, characters), honors (dragons and winds), and bonus (flowers, seasons)
 */

import { BonusTileTypes } from './types/BonusTileTypes';
import { SimpleTileTypes } from './types/SimpleTileTypes';
import { HonorTileTypes } from './types/HonorTileTypes';

export abstract class Tiles {
  static DELIMITER = '_';

  abstract toString(): string;

  abstract getType(): SimpleTileTypes | HonorTileTypes | BonusTileTypes;

  abstract getValue(): number;
}
