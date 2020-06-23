import { TileFactory } from '../../../../module/mahjong/Tile/TileFactory';
import { SimpleTiles } from '../../../../module/mahjong/Tile/SimpleTiles';
import { HonorTiles } from '../../../../module/mahjong/Tile/HonorTiles';
import { BonusTiles } from '../../../../module/mahjong/Tile/BonusTiles';

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
