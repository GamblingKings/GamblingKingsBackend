/**
 * Class that extends the Tiles.ts class.
 * Represents a Wind or Dragon tile.
 */

import { Tiles } from './Tiles';
import { HonorTileTypes } from './types/HonorTileTypes';

export class HonorTiles extends Tiles {
  private type: HonorTileTypes;

  private value: number;

  /**
   * Public constructor.
   * @param type a type from the BonusTileTypes Enum
   */
  constructor(type: HonorTileTypes) {
    super();
    this.type = type;
    this.value = -1;
  }

  /**
   * @returns the type property
   */
  public getType(): HonorTileTypes {
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
    return `${this.type}`;
  }
}
