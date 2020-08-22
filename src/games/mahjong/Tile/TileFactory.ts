/**
 * Class designed to create a Tiles given a string definition
 */

import { TileMapper } from './map/TileMapper';

import { SimpleTileTypes } from './types/SimpleTileTypes';
import { BonusTileTypes } from './types/BonusTileTypes';
import { HonorTileTypes } from './types/HonorTileTypes';

import { TileDefinition } from '../types/MahjongTypes';
import { Tile } from './Tile';
import { BonusTile } from './BonusTile';
import { SimpleTile } from './SimpleTile';
import { HonorTile } from './HonorTile';

export class TileFactory {
  /**
   *
   * @param strDef : string representation of a tile
   * @returns a SimpleTile, BonusTile, or HonorTile depending on the strDef
   */
  static createTileFromStringDef(strDef: string): SimpleTile | BonusTile | HonorTile {
    const mappedTile: TileDefinition = TileMapper[strDef];
    const splitMappedTile: string[] = strDef.split(Tile.DELIMITER);

    if (splitMappedTile.length === 1) {
      return new HonorTile(mappedTile.type as HonorTileTypes);
    }

    if (Object.values(SimpleTileTypes).includes(splitMappedTile[1] as SimpleTileTypes)) {
      return new SimpleTile(mappedTile.type as SimpleTileTypes, mappedTile.value);
    }

    return new BonusTile(mappedTile.type as BonusTileTypes, mappedTile.value);
  }

  static createStringDefFromTile(tile: Tile): string {
    // For HonorTiles
    if (tile.getValue() === -1) {
      return `${tile.getType()}`;
    }

    // For SimpleTiles and BonusTiles
    return `${tile.getValue()}_${tile.getType()}`;
  }
}
