import { HonorTileTypes } from '../../../../src/games/mahjong/Tile/types/HonorTileTypes';
import { HonorTile } from '../../../../src/games/mahjong/Tile/HonorTile';

const { REDDRAGON } = HonorTileTypes;

test('HonorTile - getValue()', () => {
  const honorTile = new HonorTile(REDDRAGON);
  expect(honorTile.getValue()).toBe(-1);
});

test('HonorTile - toString()', () => {
  const type = HonorTileTypes.EAST;
  const t = new HonorTile(type);
  expect(t.toString()).toBe(type);
});
