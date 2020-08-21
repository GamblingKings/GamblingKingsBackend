/**
 * Class that extends the Tile.ts class.
 * Represents a Dot, Bamboo, or Character Tile
 */
import { Tile } from './Tile';
import { SimpleTileTypes } from './types/SimpleTileTypes';

export class SimpleTile extends Tile {
  private type: SimpleTileTypes;

  private value: number;

  /**
   * Public constructor.
   * @param type a type from the BonusTileTypes Enum
   * @param value A number from 1 - 9
   */
  constructor(type: SimpleTileTypes, value: number) {
    super();

    if (value < 1 || value > 9) {
      throw new RangeError('Value must be between 1 - 9');
    }

    this.type = type;
    this.value = value;
  }

  /**
   * @returns the type property
   */
  public getType(): SimpleTileTypes {
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
    return `${this.value}${Tile.DELIMITER}${this.type}`;
  }
}
