/**
 * Class that extends the Tiles.ts class.
 * Represents a Wind or Dragon tile.
 */

import { Tiles } from './Tiles';
import { HonorTileTypes } from './types/HonorTileTypes';

export class HonorTiles extends Tiles {
  /**
   * Public constructor.
   * @param type a type from the BonusTileTypes Enum
   */
  constructor(type: HonorTileTypes) {
    super(type, -1);
  }
}
