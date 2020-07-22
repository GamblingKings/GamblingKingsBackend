import { HongKongWall } from '../../../../games/mahjong/Wall/version/HongKongWall';

const DEFAULT_WALL_LENGTH = 144;

test('wall to have DEFAULT_WALL_LENGTH tiles when initialized', () => {
  const wall = new HongKongWall();
  expect(wall.getTiles()).toHaveLength(DEFAULT_WALL_LENGTH);
});

test('Generate hand will yield a hand of 13 tiles', () => {
  const wall = new HongKongWall();
  const hand = wall.generateHand();
  expect(hand).toHaveLength(13);
});

test('Generate hand increment wall index by 13', () => {
  const wall = new HongKongWall();
  const hand = wall.generateHand();
  expect(hand).toHaveLength(13);
  expect(wall.getCurrentTileIndex()).toBe(13);
});

test('Generate hand will take tiles from the correct indexes', () => {
  const wall = new HongKongWall();

  // Call generate twice
  wall.generateHand();
  const hand = wall.generateHand();

  const tilesDrawn = [...wall.getTiles().slice(13, 13 * 2)];

  let same = true;

  for (let i = 0; i < hand.length; i += 1) {
    if (tilesDrawn[i] !== hand[i]) {
      same = false;
      break;
    }
  }

  expect(same).toBeTruthy();
});

test('Drawing from the wall increment index by 1', () => {
  const drawCount = 10;
  const wall = new HongKongWall();

  for (let i = 0; i < drawCount; i += 1) {
    wall.draw();
  }

  expect(wall.getCurrentTileIndex()).toBe(10);
});

test('able to rest the wall', () => {
  const wall = new HongKongWall();
  const originalWall = wall.getTiles();

  wall.reset();
  const newWall = wall.getTiles();

  expect(originalWall).toIncludeSameMembers(newWall);
  expect(originalWall).not.toStrictEqual(newWall);
});
