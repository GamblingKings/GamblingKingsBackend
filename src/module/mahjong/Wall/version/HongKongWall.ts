/**
 * Extends the Wall.ts class.
 * The HongKong wall has bonus tiles (flowers and seasons)
 */

import { Wall } from '../Wall';
import { Tiles } from '../../Tile/Tiles';
import { BonusTiles } from '../../Tile/BonusTiles';
import { MahjongVersions } from './Versions';

import { bonusTileInit } from '../init/Bonus';

export class HongKongWall extends Wall {
  static version: MahjongVersions = MahjongVersions.HongKong;

  /**
   * Public Constructor
   */
  constructor() {
    super();
    this.initializeWall();
  }

  /**
   * Initializes the tiles in the wall.
   * @param reset Boolean, if true, clears the wall as well
   */
  public initializeWall(reset = false): void {
    if (reset) {
      super.clear();
    }

    super.initializeSimpleTiles();
    super.initializeHonorTiles();
    this.initializeBonusTiles();
    super.shuffleTiles();
  }

  /**
   * Resets and initialize the wall.
   */
  public reset(): void {
    this.initializeWall(true);
  }

  /**
   * Initialize all the bonus tiles in the wall using the Bonus Tiles Init object
   */
  private initializeBonusTiles(): void {
    Object.values(bonusTileInit).forEach((object) => {
      for (let value = 1; value <= 4; value += 1) {
        const b: BonusTiles = new BonusTiles(object.type, value);
        this.tiles.push(b);
      }
    });
  }

  /**
   * Generate a hand
   * @returns a tile array
   */
  public generateHand(): Tiles[] {
    return super.generateHand();
  }

  /**
   * Draws a tile from the wall
   * @returns a Tiles
   */
  public draw(): Tiles | null | undefined {
    return super.draw();
  }

  /**
   * @returns the tiles property
   */
  public getTiles(): Tiles[] {
    return super.getTiles();
  }
}
