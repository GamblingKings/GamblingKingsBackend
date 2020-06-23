import { BonusTiles } from '../../../../module/mahjong/Tile/BonusTiles';
import { BonusTileTypes } from '../../../../module/mahjong/Tile/types/BonusTileTypes';

test('BonusTiles fails to initialize is range is not between 1 - 4', () => {
  const t = () => {
    const b = new BonusTiles(BonusTileTypes.FLOWER, 5);
    return b;
  };

  expect(t).toThrow(RangeError);
});
