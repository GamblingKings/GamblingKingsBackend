import { TileFactory } from '../../../../src/games/mahjong/Tile/TileFactory';
import { SimpleTile } from '../../../../src/games/mahjong/Tile/SimpleTile';
import { HonorTile } from '../../../../src/games/mahjong/Tile/HonorTile';
import { BonusTile } from '../../../../src/games/mahjong/Tile/BonusTile';
import { SimpleTileTypes } from '../../../../src/games/mahjong/Tile/types/SimpleTileTypes';
import { BonusTileTypes } from '../../../../src/games/mahjong/Tile/types/BonusTileTypes';
import { HonorTileTypes } from '../../../../src/games/mahjong/Tile/types/HonorTileTypes';

test('Tile Factory creates a Simple Tile when passed 1_DOT', () => {
  const t = TileFactory.createTileFromStringDef('1_DOT');
  expect(t).toBeInstanceOf(SimpleTile);
});

test('Tile Factory creates a Simple Tile with the correct value when passed 5_CHARACTER', () => {
  const t = TileFactory.createTileFromStringDef('5_CHARACTER');
  expect(t.getValue()).toBe(5);
});

test('Tile Factory creates a Simple Tile with the correct type when passed 8_BAMBOO', () => {
  const t = TileFactory.createTileFromStringDef('8_BAMBOO');
  expect(t.getType()).toBe('BAMBOO');
});

test('Tile Factory creates a Honor Tile when passed NORTH', () => {
  const t = TileFactory.createTileFromStringDef('NORTH');
  expect(t).toBeInstanceOf(HonorTile);
});

test('Tile Factory create a Honor Tile with the correct type when passed REDDRAGON', () => {
  const t = TileFactory.createTileFromStringDef('REDDRAGON');
  expect(t.getType()).toBe('REDDRAGON');
});

test('Tile Factory creates a Bonus Tile when passed 1_FLOWER', () => {
  const t = TileFactory.createTileFromStringDef('1_FLOWER');
  expect(t).toBeInstanceOf(BonusTile);
});

test('Tile Factory creates a Bonus Tile with the correct type when passed 2_FLOWER', () => {
  const t = TileFactory.createTileFromStringDef('2_FLOWER');
  expect(t.getType()).toBe('FLOWER');
});

test('Tile Factory creates a Bonus Tile with the correct value when passed 2_SEASON', () => {
  const t = TileFactory.createTileFromStringDef('2_SEASON');
  expect(t.getValue()).toBe(2);
});

describe('test static createStringDefFromTile', () => {
  test('it should create a string definition from a simple tile object', () => {
    const simpleTileDot = new SimpleTile(SimpleTileTypes.DOT, 1);
    const simpleTileBamboo = new SimpleTile(SimpleTileTypes.BAMBOO, 2);
    const simpleTileCharacter = new SimpleTile(SimpleTileTypes.CHARACTER, 3);

    const simpleTileDotStringDef = TileFactory.createStringDefFromTile(simpleTileDot);
    const simpleTileBambooStringDef = TileFactory.createStringDefFromTile(simpleTileBamboo);
    const simpleTileCharacterStringDef = TileFactory.createStringDefFromTile(simpleTileCharacter);

    expect(simpleTileDotStringDef).toBe('1_DOT');
    expect(simpleTileBambooStringDef).toBe('2_BAMBOO');
    expect(simpleTileCharacterStringDef).toBe('3_CHARACTER');
  });

  test('it should create a string definition from a bonus tile object', () => {
    const bonusTileSeason = new BonusTile(BonusTileTypes.SEASON, 1);
    const bonusTileFlower = new BonusTile(BonusTileTypes.FLOWER, 4);
    const bonusTileSeasonStringDef = TileFactory.createStringDefFromTile(bonusTileSeason);
    const bonusTileFlowerStringDef = TileFactory.createStringDefFromTile(bonusTileFlower);

    expect(bonusTileSeasonStringDef).toBe('1_SEASON');
    expect(bonusTileFlowerStringDef).toBe('4_FLOWER');
  });

  test('it should create a string definition from a honor tile object', () => {
    const honorTileEast = new HonorTile(HonorTileTypes.EAST);
    const honorTileSouth = new HonorTile(HonorTileTypes.SOUTH);
    const honorTileWest = new HonorTile(HonorTileTypes.WEST);
    const honorTileNorth = new HonorTile(HonorTileTypes.NORTH);
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
