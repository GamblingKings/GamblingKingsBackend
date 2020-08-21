import { SimpleTileTypes } from '../../../../src/games/mahjong/Tile/types/SimpleTileTypes';
import { SimpleTile } from '../../../../src/games/mahjong/Tile/SimpleTile';

test('SimpleTile fails to initialize is range is not between 1 - 9', () => {
  const t = () => {
    return new SimpleTile(SimpleTileTypes.DOT, 10);
  };

  expect(t).toThrow(RangeError);
});

test('HonorTile - toString()', () => {
  const type = SimpleTileTypes.BAMBOO;
  const value = 9;
  const t = new SimpleTile(type, value);
  expect(t.toString()).toBe(`${value}_${type}`);
});
