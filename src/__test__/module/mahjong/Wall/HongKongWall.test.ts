import { HongKongWall } from '../../../../module/mahjong/Wall/version/HongKongWall';

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

test('Generate hand will remove 13 tiles from the wall', () => {
  const wall = new HongKongWall();
  const hand = wall.generateHand();
  expect(wall.getTiles()).toHaveLength(DEFAULT_WALL_LENGTH - hand.length);
});

test('Generate hand will take the last 13 tiles from the wall', () => {
  const wall = new HongKongWall();
  const lastThirteen = [...wall.getTiles().slice(wall.getTiles.length - 13)];
  const hand = wall.generateHand();

  let same = true;

  for (let i = 0; i < hand.length; i += 1) {
    if (lastThirteen[i] !== hand[i]) {
      same = false;
      break;
    }
  }

  expect(same).toBeTruthy();
});

test('Drawing from the wall removes 1 from the wall', () => {
  const drawCount = 10;
  const wall = new HongKongWall();

  for (let i = 0; i < drawCount; i += 1) {
    wall.draw();
  }

  expect(wall.getTiles()).toHaveLength(DEFAULT_WALL_LENGTH - drawCount);
});

test('able to rest the wall', () => {
  const wall = new HongKongWall();

  const drawCount = 50;
  for (let i = 0; i < drawCount; i += 1) {
    wall.draw();
  }

  wall.reset();

  expect(wall.getTiles()).toHaveLength(DEFAULT_WALL_LENGTH);
});
