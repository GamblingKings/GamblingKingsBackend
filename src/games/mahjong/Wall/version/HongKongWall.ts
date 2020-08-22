/**
 * Extends the Wall.ts class.
 * The HongKong wall has bonus tiles (flowers and seasons)
 */

import { Wall } from '../Wall';
import { BonusTile } from '../../Tile/BonusTile';
import { MahjongVersions } from './Versions';

import { bonusTileInit } from '../init/Bonus';
import { TileFactory } from '../../Tile/TileFactory';
import { HongKongMahjongHand } from '../../types/MahjongTypes';
import { BonusTilesMapper } from '../../Tile/map/TileMapper';

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
   * Initialize all the bonus tiles in the wall using the Bonus Tile Init object
   */
  private initializeBonusTiles(): void {
    Object.values(bonusTileInit).forEach((object) => {
      for (let value = 1; value <= 4; value += 1) {
        const b: BonusTile = new BonusTile(object.type, value);
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
   * Generate initial hand by separating bonus tiles and other tiles into a
   * different array (see HongKongMahjongHand for more details).
   */
  public getInitialTiles(): HongKongMahjongHand {
    // Get a new hand
    const initHand = this.generateHand();

    // Get bonus tiles and a cleaned hand (without any bonus tiles)
    const allBonusTiles = Object.keys(BonusTilesMapper);
    const bonusTilesInHand: string[] = [];
    const cleanedHand: string[] = [];
    initHand.forEach((tile: string) => {
      if (allBonusTiles.includes(tile)) {
        bonusTilesInHand.push(tile);
      } else {
        cleanedHand.push(tile);
      }
    });

    // Draw the same amount of tiles as the discarded bonus tiles
    const { length } = bonusTilesInHand;
    if (length) {
      for (let i = 0; i < length; i += 1) {
        let newTile = this.draw() as string;
        let isBonusTile = allBonusTiles.includes(newTile);

        // Keep drawing new tiles until it is not a bonus tile
        while (isBonusTile) {
          bonusTilesInHand.push(newTile);
          newTile = this.draw() as string;
          isBonusTile = allBonusTiles.includes(newTile);
        }

        cleanedHand.push(newTile);
      }
    }

    return {
      hand: cleanedHand,
      bonusTiles: bonusTilesInHand,
    };
  }

  /**
   * Draws a tile from the wall
   * @returns a Tile
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
