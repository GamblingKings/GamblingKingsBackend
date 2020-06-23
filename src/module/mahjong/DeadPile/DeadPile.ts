/**
 * The DeadPile class represents the pool of tiles that is no longer in play. Tiles are added to
 * the deadpile when the tile is "thrown" from a player hand and no one takes the tile.
 * Tiles in the deadpile are therefore considered to be out of play.
 */

import { Tiles } from '../Tile/Tiles';

export class DeadPile {
  private deadpile: Tiles[];

  private lastThrow: Tiles | null;

  /**
   * Public constructor
   */
  constructor() {
    this.deadpile = [];
    this.lastThrow = null;
  }

  /**
   * @returns the deadpile array
   */
  public getDeadPile(): Tiles[] {
    return this.deadpile;
  }

  /**
   * @returns the lastThrow property
   */
  public getLastThrown(): Tiles | null {
    return this.lastThrow;
  }

  /**
   * Adds a tile to the deadpile
   * @param t A Tiles object, i.e. SimpleTiles, BonusTiles, HonorTiles
   */
  public add(t: Tiles): boolean {
    this.deadpile.push(t);
    return true;
  }

  /**
   * Adds the lastThrow Tiles to the deadPile and reassigns the lastThrow to be a tile object
   * @param t A Tiles object, i.e. SimpleTiles, BonusTiles, HonorTiles
   */
  public lastThrown(t: Tiles): void {
    if (this.lastThrow) {
      this.add(this.lastThrow);
    }

    this.lastThrow = t;
  }

  /**
   * Resets the deadPile
   */
  public clear(): void {
    this.deadpile = [];
    this.lastThrow = null;
  }
}
