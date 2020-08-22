/**
 * The Wall class represents the "wall" or pool of available tiles.
 * The wall contains 144 tiles(if Hong Kong version) at the start and 92 once hands(4) have been formed.
 * Players are able to draw a tile from the wall. Typically the game will end
 * if no players have a winning hand or the end of the wall is reached.
 * Different versions of mahjong have different implementations of the wall
 * and thus this class is left for inheritence
 */

import { SimpleTile } from '../Tile/SimpleTile';
import { HonorTile } from '../Tile/HonorTile';

import { simpleTileInit } from './init/Simple';
import { honorTileInit } from './init/Honor';
import { TileFactory } from '../Tile/TileFactory';
import { DEFAULT_HAND_LENGTH } from '../../../utils/constants';

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
          const t: SimpleTile = new SimpleTile(object.type, value);
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
        const t: HonorTile = new HonorTile(object.type);
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
   * @returns a Tile Array
   */
  public generateHand(): string[] {
    const hand: string[] = [];
    for (let i = 0; i < DEFAULT_HAND_LENGTH; i += 1) {
      const currentTile = this.tiles[this.currentTileIndex];
      hand.push(currentTile);
      this.currentTileIndex += 1;
    }

    return hand;
  }

  /**
   * Draws a tile from the wall
   * @returns a Tile if available, otherwise null
   */
  public draw(): string | undefined | null {
    if (this.currentTileIndex < Wall.DEFAULT_WALL_LENGTH) {
      // currentTileIndex is the next available tile,
      // so need to get it before incrementing the index
      const newTile = this.tiles[this.currentTileIndex];
      this.currentTileIndex += 1;

      return newTile;
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
   * Set tiles in the wall for testing purposes.
   */
  public setTiles(tiles: string[]): boolean {
    if (tiles.length > Wall.DEFAULT_WALL_LENGTH) return false;

    this.tiles = tiles;
    return true;
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
