/**
 * Class that extends the Tiles.ts class.
 * Represents a Dot, Bamboo, or Character Tiles
 */

import { Tiles } from './Tiles';
import { SimpleTileTypes } from './types/SimpleTileTypes';

export class SimpleTiles extends Tiles {
  /**
   * Public constructor.
   * @param type a type from the BonusTileTypes Enum
   * @param value A number from 1 - 9
   */
  constructor(type: SimpleTileTypes, value: number) {
    super(type, value);

    if (value < 1 || value > 9) {
      throw new RangeError('Value must be between 1 - 9');
    }
  }
}
