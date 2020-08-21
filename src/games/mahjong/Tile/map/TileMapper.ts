/**
 * Tile Mapping used to create a tile given a string value
 */

import { SimpleTileTypes } from '../types/SimpleTileTypes';
import { BonusTileTypes } from '../types/BonusTileTypes';
import { HonorTileTypes } from '../types/HonorTileTypes';
import { TileDefinition } from '../../types/MahjongTypes';

export const DotSimpleTilesMapper: { [index: string]: TileDefinition } = {
  '1_DOT': { type: SimpleTileTypes.DOT, value: 1 },
  '2_DOT': { type: SimpleTileTypes.DOT, value: 2 },
  '3_DOT': { type: SimpleTileTypes.DOT, value: 3 },
  '4_DOT': { type: SimpleTileTypes.DOT, value: 4 },
  '5_DOT': { type: SimpleTileTypes.DOT, value: 5 },
  '6_DOT': { type: SimpleTileTypes.DOT, value: 6 },
  '7_DOT': { type: SimpleTileTypes.DOT, value: 7 },
  '8_DOT': { type: SimpleTileTypes.DOT, value: 8 },
  '9_DOT': { type: SimpleTileTypes.DOT, value: 9 },
};

export const BambooSimpleTilesMapper: { [index: string]: TileDefinition } = {
  '1_BAMBOO': { type: SimpleTileTypes.BAMBOO, value: 1 },
  '2_BAMBOO': { type: SimpleTileTypes.BAMBOO, value: 2 },
  '3_BAMBOO': { type: SimpleTileTypes.BAMBOO, value: 3 },
  '4_BAMBOO': { type: SimpleTileTypes.BAMBOO, value: 4 },
  '5_BAMBOO': { type: SimpleTileTypes.BAMBOO, value: 5 },
  '6_BAMBOO': { type: SimpleTileTypes.BAMBOO, value: 6 },
  '7_BAMBOO': { type: SimpleTileTypes.BAMBOO, value: 7 },
  '8_BAMBOO': { type: SimpleTileTypes.BAMBOO, value: 8 },
  '9_BAMBOO': { type: SimpleTileTypes.BAMBOO, value: 9 },
};

export const CharacterSimpleTilesMapper: { [index: string]: TileDefinition } = {
  '1_CHARACTER': { type: SimpleTileTypes.CHARACTER, value: 1 },
  '2_CHARACTER': { type: SimpleTileTypes.CHARACTER, value: 2 },
  '3_CHARACTER': { type: SimpleTileTypes.CHARACTER, value: 3 },
  '4_CHARACTER': { type: SimpleTileTypes.CHARACTER, value: 4 },
  '5_CHARACTER': { type: SimpleTileTypes.CHARACTER, value: 5 },
  '6_CHARACTER': { type: SimpleTileTypes.CHARACTER, value: 6 },
  '7_CHARACTER': { type: SimpleTileTypes.CHARACTER, value: 7 },
  '8_CHARACTER': { type: SimpleTileTypes.CHARACTER, value: 8 },
  '9_CHARACTER': { type: SimpleTileTypes.CHARACTER, value: 9 },
};

export const HonorTilesMapper: { [index: string]: TileDefinition } = {
  EAST: { type: HonorTileTypes.EAST, value: -1 },
  SOUTH: { type: HonorTileTypes.SOUTH, value: -1 },
  WEST: { type: HonorTileTypes.WEST, value: -1 },
  NORTH: { type: HonorTileTypes.NORTH, value: -1 },
  REDDRAGON: { type: HonorTileTypes.REDDRAGON, value: -1 },
  GREENDRAGON: { type: HonorTileTypes.GREENDRAGON, value: -1 },
  WHITEDRAGON: { type: HonorTileTypes.WHITEDRAGON, value: -1 },
};

export const BonusTilesMapper: { [index: string]: TileDefinition } = {
  '1_FLOWER': { type: BonusTileTypes.FLOWER, value: 1 },
  '2_FLOWER': { type: BonusTileTypes.FLOWER, value: 2 },
  '3_FLOWER': { type: BonusTileTypes.FLOWER, value: 3 },
  '4_FLOWER': { type: BonusTileTypes.FLOWER, value: 4 },
  '1_SEASON': { type: BonusTileTypes.SEASON, value: 1 },
  '2_SEASON': { type: BonusTileTypes.SEASON, value: 2 },
  '3_SEASON': { type: BonusTileTypes.SEASON, value: 3 },
  '4_SEASON': { type: BonusTileTypes.SEASON, value: 4 },
};

export const TileMapper: { [index: string]: TileDefinition } = {
  ...DotSimpleTilesMapper,
  ...BambooSimpleTilesMapper,
  ...CharacterSimpleTilesMapper,
  ...HonorTilesMapper,
  ...BonusTilesMapper,
};
