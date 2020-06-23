/**
 * Object used to initialize Bonus Tiles in the wall class
 */

import { BonusTileTypes } from '../../Tile/types/BonusTileTypes';

type BonusTileInitObject = {
  flowers: {
    type: BonusTileTypes;
    range: number;
  };
  seasons: {
    type: BonusTileTypes;
    range: number;
  };
};

export const bonusTileInit: BonusTileInitObject = {
  flowers: {
    type: BonusTileTypes.FLOWER,
    range: 4,
  },
  seasons: {
    type: BonusTileTypes.SEASON,
    range: 4,
  },
};
