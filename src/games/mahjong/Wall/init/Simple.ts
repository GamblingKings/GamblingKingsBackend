/**
 * Object used to initialize Simple Tile in the wall class
 */

import { SimpleTileTypes } from '../../Tile/types/SimpleTileTypes';

type SimpleTileInitObject = {
  dots: {
    type: SimpleTileTypes;
    range: number;
  };
  bamboo: {
    type: SimpleTileTypes;
    range: number;
  };
  characters: {
    type: SimpleTileTypes;
    range: number;
  };
};

export const simpleTileInit: SimpleTileInitObject = {
  dots: {
    type: SimpleTileTypes.DOT,
    range: 9,
  },
  bamboo: {
    type: SimpleTileTypes.BAMBOO,
    range: 9,
  },
  characters: {
    type: SimpleTileTypes.CHARACTER,
    range: 9,
  },
};
