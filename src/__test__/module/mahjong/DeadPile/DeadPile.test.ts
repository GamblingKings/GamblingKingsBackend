import { DeadPile } from '../../../../module/mahjong/DeadPile/DeadPile';
import { SimpleTiles } from '../../../../module/mahjong/Tile/SimpleTiles';
import { SimpleTileTypes } from '../../../../module/mahjong/Tile/types/SimpleTileTypes';

const charSimpleTile = new SimpleTiles(SimpleTileTypes.CHARACTER, 1);
const bambooSimpleTile = new SimpleTiles(SimpleTileTypes.BAMBOO, 5);
const d = new DeadPile();

test('Test that the DeadPile stores the last thrown and gets thrown into deadpile if another tile is added', () => {
  d.lastThrown(charSimpleTile);
  d.lastThrown(bambooSimpleTile);

  expect(d.getDeadPile().includes(charSimpleTile)).toBeTruthy();
});

test('Test that the DeadPile only has one tile in the dead pile', () => {
  expect(d.getDeadPile()).toHaveLength(1);
});
