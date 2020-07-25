/**
 * The Tiles class represents a single Tiles used in Mahjong.
 * There are different types of tiles which can be categorized
 * as simple (dots, bamboo, characters), honors (dragons and winds), and bonus (flowers, seasons)
 */

import { BonusTileTypes } from './types/BonusTileTypes';
import { SimpleTileTypes } from './types/SimpleTileTypes';
import { HonorTileTypes } from './types/HonorTileTypes';

export abstract class Tiles {
  static DELIMITER = '_';

  // eslint-disable-next-line no-useless-constructor
  constructor(private type: SimpleTileTypes | HonorTileTypes | BonusTileTypes, private value: number) {}

  /**
   * @returns the type property
   */
  public getType(): SimpleTileTypes | HonorTileTypes | BonusTileTypes {
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
