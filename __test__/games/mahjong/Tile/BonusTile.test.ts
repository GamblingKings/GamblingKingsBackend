import { BonusTile } from '../../../../src/games/mahjong/Tile/BonusTile';
import { BonusTileTypes } from '../../../../src/games/mahjong/Tile/types/BonusTileTypes';

test('BonusTiles fails to initialize is range is not between 1 - 4', () => {
  const t = () => {
    const b = new BonusTile(BonusTileTypes.FLOWER, 5);
    return b;
  };

  expect(t).toThrow(RangeError);
});
