import { SimpleTiles } from '../../../../src/games/mahjong/Tile/SimpleTiles';
import { SimpleTileTypes } from '../../../../src/games/mahjong/Tile/types/SimpleTileTypes';

test('SimpleTiles fails to initialize is range is not between 1 - 9', () => {
  const t = () => {
    const s = new SimpleTiles(SimpleTileTypes.DOT, 10);
    return s;
  };

  expect(t).toThrow(RangeError);
});
