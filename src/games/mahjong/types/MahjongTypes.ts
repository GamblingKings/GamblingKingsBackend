/**
 * File to store types used in Mahjong classes
 */

import { SimpleTileTypes } from '../Tile/types/SimpleTileTypes';
import { HonorTileTypes } from '../Tile/types/HonorTileTypes';
import { BonusTileTypes } from '../Tile/types/BonusTileTypes';

export interface TileDefinition {
  type: SimpleTileTypes | HonorTileTypes | BonusTileTypes;
  value: number;
}
