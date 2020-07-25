/**
 * Extends the Wall.ts class.
 * The HongKong wall has bonus tiles (flowers and seasons)
 */

import { Wall } from '../Wall';
import { BonusTiles } from '../../Tile/BonusTiles';
import { MahjongVersions } from './Versions';

import { bonusTileInit } from '../init/Bonus';
import { TileFactory } from '../../Tile/TileFactory';

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
        const stringDef: string = TileFactory.createStringDefFromTile(b);
        this.tiles.push(stringDef);
      }
    });
  }

  /**
   * Generate a hand
   * @returns a tile array
   */
  public generateHand(): string[] {
    return super.generateHand();
  }

  /**
   * Draws a tile from the wall
   * @returns a Tiles
   */
  public draw(): string | null | undefined {
    return super.draw();
  }

  /**
   * @returns the tiles property
   */
  public getTiles(): string[] {
    return super.getTiles();
  }

  /**
   * Get current tile index number
   */
  public getCurrentTileIndex(): number {
    return super.getCurrentTileIndex();
  }
}
