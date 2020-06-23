/**
 * Class that extends the Tiles.ts class.
 * Represents a Flower or Season tile.
 */

import { Tiles } from './Tiles';
import { BonusTileTypes } from './types/BonusTileTypes';

export class BonusTiles extends Tiles {
  private type: BonusTileTypes;

  private value: number;

  /**
   * Public constructor.
   * @param type a type from the BonusTileTypes Enum
   * @param value A number from 1 - 4
   */
  constructor(type: BonusTileTypes, value: number) {
    super();

    if (value < 1 || value > 4) {
      throw new RangeError('Value must be between 1 - 4');
    }

    this.type = type;
    this.value = value;
  }

  /**
   * @returns the type property
   */
  public getType(): BonusTileTypes {
    return this.type;
  }

  /**
   * @returns the value property
   */
  public getValue(): number {
    return this.value;
  }

  /**
   * @returns a string representation of the object
   */
  public toString(): string {
    return `${this.value}${Tiles.DELIMITER}${this.type}`;
  }
}
