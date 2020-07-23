/**
 * The Wall class represents the "wall" or pool of available tiles.
 * The wall contains 144 tiles(if Hong Kong version) at the start and 92 once hands(4) have been formed.
 * Players are able to draw a tile from the wall. Typically the game will end
 * if no players have a winning hand or the end of the wall is reached.
 * Different versions of mahjong have different implementations of the wall
 * and thus this class is left for inheritence
 */

import { SimpleTiles } from '../Tile/SimpleTiles';
import { HonorTiles } from '../Tile/HonorTiles';

import { simpleTileInit } from './init/Simple';
import { honorTileInit } from './init/Honor';
import { TileFactory } from '../Tile/TileFactory';

export abstract class Wall {
  static DEFAULT_NUM_OF_TILE = 4;

  static DEFAULT_WALL_LENGTH = 144;

  protected tiles: string[];

  private currentTileIndex: number;

  /**
   * Public constructor.
   */
  constructor() {
    this.tiles = [];
    this.currentTileIndex = 0;
  }

  /**
   * Abstract Methods
   */
  abstract initializeWall(reset: boolean): void;

  /**
   * Common methods to be used by children
   */

  /**
   * Intializes all Simple tiles using an the SimpleTileInit object
   */
  protected initializeSimpleTiles(): void {
    Object.values(simpleTileInit).forEach((object) => {
      for (let value = 1; value <= object.range; value += 1) {
        for (let i = 0; i < Wall.DEFAULT_NUM_OF_TILE; i += 1) {
          const t: SimpleTiles = new SimpleTiles(object.type, value);
          const stringDef: string = TileFactory.createStringDefFromTile(t);
          this.tiles.push(stringDef);
        }
      }
    });
  }

  /**
   * Intializes all Honor tiles using an the HonorTileInit object
   */
  protected initializeHonorTiles(): void {
    Object.values(honorTileInit).forEach((object) => {
      for (let i = 0; i < Wall.DEFAULT_NUM_OF_TILE; i += 1) {
        const t: HonorTiles = new HonorTiles(object.type);
        const stringDef: string = TileFactory.createStringDefFromTile(t);
        this.tiles.push(stringDef);
      }
    });
  }

  /**
   * Shuffles all the tile in the wall
   */
  protected shuffleTiles(): void {
    for (let i = 0; i < this.tiles.length; i += 1) {
      const rnd = Math.floor(Math.random() * this.tiles.length);
      [this.tiles[i], this.tiles[rnd]] = [this.tiles[rnd], this.tiles[i]];
    }
  }

  /**
   * Generates a hand from the wall
   * @returns a Tiles Array
   */
  public generateHand(): string[] {
    const hand: string[] = [];
    for (let i = 0; i < 13; i += 1) {
      const currentTile = this.tiles[this.currentTileIndex];
      hand.push(currentTile);
      this.currentTileIndex += 1;
    }

    return hand;
  }

  /**
   * Draws a tile from the wall
   * @returns a Tiles if available, otherwise null
   */
  public draw(): string | undefined | null {
    if (this.currentTileIndex < Wall.DEFAULT_WALL_LENGTH) {
      this.currentTileIndex += 1;
      return this.tiles[this.currentTileIndex];
    }

    return null;
  }

  /**
   * @returns the tile property
   */
  public getTiles(): string[] {
    return this.tiles;
  }

  /**
   * Clears the tiles array
   */
  public clear(): void {
    this.tiles = [];
  }

  /**
   * Get current tile index number
   */
  public getCurrentTileIndex(): number {
    return this.currentTileIndex;
  }
}
