/**
 * Class designed to create a Tiles given a string definition
 */

import { SimpleTiles } from './SimpleTiles';
import { BonusTiles } from './BonusTiles';
import { HonorTiles } from './HonorTiles';
import { Tiles } from './Tiles';
import { TileMapper } from './map/TileMapper';

import { SimpleTileTypes } from './types/SimpleTileTypes';
import { BonusTileTypes } from './types/BonusTileTypes';
import { HonorTileTypes } from './types/HonorTileTypes';

import { TileDefinition } from '../types/MahjongTypes';

export class TileFactory {
  /**
   *
   * @param strDef : string representation of a tile
   * @returns a SimpleTiles, BonusTiles, or HonorTiles depending on the strDef
   */
  static createTileFromStringDef(strDef: string): SimpleTiles | BonusTiles | HonorTiles {
    const mappedTile: TileDefinition = TileMapper[strDef];
    const splitMappedTile: string[] = strDef.split(Tiles.DELIMITER);

    if (splitMappedTile.length === 1) {
      return new HonorTiles(<HonorTileTypes>mappedTile.type);
    }

    if (Object.values(SimpleTileTypes).includes(<SimpleTileTypes>splitMappedTile[1])) {
      return new SimpleTiles(<SimpleTileTypes>mappedTile.type, mappedTile.value);
    }

    return new BonusTiles(<BonusTileTypes>mappedTile.type, mappedTile.value);
  }
}
