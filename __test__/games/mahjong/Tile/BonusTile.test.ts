import { BonusTileTypes } from '../../../../src/games/mahjong/Tile/types/BonusTileTypes';
import { BonusTile } from '../../../../src/games/mahjong/Tile/BonusTile';

test('BonusTile fails to initialize is range is not between 1 - 4', () => {
  const t = () => {
    return new BonusTile(BonusTileTypes.FLOWER, 5);
  };

  expect(t).toThrow(RangeError);
});

test('BonusTile - toString()', () => {
  const type = BonusTileTypes.SEASON;
  const value = 4;
  const t = new BonusTile(type, value);
  expect(t.toString()).toBe(`${value}_${type}`);
});
