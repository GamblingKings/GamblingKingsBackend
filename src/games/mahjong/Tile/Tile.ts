/**
 * The Tile class represents a single Tile used in Mahjong.
 * There are different types of tiles which can be categorized
 * as simple (dots, bamboo, characters), honors (dragons and winds), and bonus (flowers, seasons)
 */
import { SimpleTileTypes } from './types/SimpleTileTypes';
import { BonusTileTypes } from './types/BonusTileTypes';
import { HonorTileTypes } from './types/HonorTileTypes';

export abstract class Tile {
  static DELIMITER = '_';

  abstract toString(): string;

  abstract getType(): SimpleTileTypes | HonorTileTypes | BonusTileTypes;

  abstract getValue(): number;
}
