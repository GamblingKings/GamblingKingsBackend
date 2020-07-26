import { TileFactory } from '../../../../src/games/mahjong/Tile/TileFactory';
import { SimpleTiles } from '../../../../src/games/mahjong/Tile/SimpleTiles';
import { HonorTiles } from '../../../../src/games/mahjong/Tile/HonorTiles';
import { BonusTiles } from '../../../../src/games/mahjong/Tile/BonusTiles';
import { SimpleTileTypes } from '../../../../src/games/mahjong/Tile/types/SimpleTileTypes';
import { BonusTileTypes } from '../../../../src/games/mahjong/Tile/types/BonusTileTypes';
import { HonorTileTypes } from '../../../../src/games/mahjong/Tile/types/HonorTileTypes';

test('Tiles Factory creates a Simple Tiles when passed 1_DOT', () => {
  const t = TileFactory.createTileFromStringDef('1_DOT');
  expect(t).toBeInstanceOf(SimpleTiles);
});

test('Tiles Factory creates a Simple Tiles with the correct value when passed 5_CHARACTER', () => {
  const t = TileFactory.createTileFromStringDef('5_CHARACTER');
  expect(t.getValue()).toBe(5);
});

test('Tiles Factory creates a Simple Tiles with the correct type when passed 8_BAMBOO', () => {
  const t = TileFactory.createTileFromStringDef('8_BAMBOO');
  expect(t.getType()).toBe('BAMBOO');
});

test('Tiles Factory creates a Honor Tiles when passed NORTH', () => {
  const t = TileFactory.createTileFromStringDef('NORTH');
  expect(t).toBeInstanceOf(HonorTiles);
});

test('Tiles Factory create a Honor Tiles with the correct type when passed REDDRAGON', () => {
  const t = TileFactory.createTileFromStringDef('REDDRAGON');
  expect(t.getType()).toBe('REDDRAGON');
});

test('Tiles Factory creates a Bonus Tiles when passed 1_FLOWER', () => {
  const t = TileFactory.createTileFromStringDef('1_FLOWER');
  expect(t).toBeInstanceOf(BonusTiles);
});

test('Tiles Factory creates a Bonus Tiles with the correct type when passed 2_FLOWER', () => {
  const t = TileFactory.createTileFromStringDef('2_FLOWER');
  expect(t.getType()).toBe('FLOWER');
});

test('Tiles Factory creates a Bonus Tiles with the correct value when passed 2_SEASON', () => {
  const t = TileFactory.createTileFromStringDef('2_SEASON');
  expect(t.getValue()).toBe(2);
});

describe('test static createStringDefFromTile', () => {
  test('it should create a string definition from a simple tile object', () => {
    const simpleTileDot = new SimpleTiles(SimpleTileTypes.DOT, 1);
    const simpleTileBamboo = new SimpleTiles(SimpleTileTypes.BAMBOO, 2);
    const simpleTileCharacter = new SimpleTiles(SimpleTileTypes.CHARACTER, 3);

    const simpleTileDotStringDef = TileFactory.createStringDefFromTile(simpleTileDot);
    const simpleTileBambooStringDef = TileFactory.createStringDefFromTile(simpleTileBamboo);
    const simpleTileCharacterStringDef = TileFactory.createStringDefFromTile(simpleTileCharacter);

    expect(simpleTileDotStringDef).toBe('1_DOT');
    expect(simpleTileBambooStringDef).toBe('2_BAMBOO');
    expect(simpleTileCharacterStringDef).toBe('3_CHARACTER');
  });

  test('it should create a string definition from a bonus tile object', () => {
    const bonusTileSeason = new BonusTiles(BonusTileTypes.SEASON, 1);
    const bonusTileFlower = new BonusTiles(BonusTileTypes.FLOWER, 4);
    const bonusTileSeasonStringDef = TileFactory.createStringDefFromTile(bonusTileSeason);
    const bonusTileFlowerStringDef = TileFactory.createStringDefFromTile(bonusTileFlower);

    expect(bonusTileSeasonStringDef).toBe('1_SEASON');
    expect(bonusTileFlowerStringDef).toBe('4_FLOWER');
  });

  test('it should create a string definition from a honor tile object', () => {
    const honorTileEast = new HonorTiles(HonorTileTypes.EAST);
    const honorTileSouth = new HonorTiles(HonorTileTypes.SOUTH);
    const honorTileWest = new HonorTiles(HonorTileTypes.WEST);
    const honorTileNorth = new HonorTiles(HonorTileTypes.NORTH);
    const honorTileEastStringDef = TileFactory.createStringDefFromTile(honorTileEast);
    const honorTileSouthStringDef = TileFactory.createStringDefFromTile(honorTileSouth);
    const honorTileWestStringDef = TileFactory.createStringDefFromTile(honorTileWest);
    const honorTileNorthStringDef = TileFactory.createStringDefFromTile(honorTileNorth);

    expect(honorTileEastStringDef).toBe('EAST');
    expect(honorTileSouthStringDef).toBe('SOUTH');
    expect(honorTileWestStringDef).toBe('WEST');
    expect(honorTileNorthStringDef).toBe('NORTH');
  });
});
