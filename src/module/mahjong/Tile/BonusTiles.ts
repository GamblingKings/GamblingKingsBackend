/**
 * Class that extends the Tiles.ts class.
 * Represents a Flower or Season tile.
 */

import { Tiles } from './Tiles';
import { BonusTileTypes } from './types/BonusTileTypes';

export class BonusTiles extends Tiles {
  /**
   * Public constructor.
   * @param type a type from the BonusTileTypes Enum
   * @param value A number from 1 - 4
   */
  constructor(type: BonusTileTypes, value: number) {
    super(type, value);

    if (value < 1 || value > 4) {
      throw new RangeError('Value must be between 1 - 4');
    }
  }
}
