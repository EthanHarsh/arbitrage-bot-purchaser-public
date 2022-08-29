import {LPAPI} from './contractAbis';
import {Contract} from 'ethers';

import PROVIDER from './provider';

const USDCFTM = {
  address: '0x2b4C76d0dc16BE1C31D4C1DC53bF9B45987Fc75c',
};

export const usdcFtmLpContract = new Contract(
    USDCFTM.address,
    LPAPI,
    PROVIDER,
);

const DAIFTM = {
  address: '0xe120ffBDA0d14f3Bb6d6053E90E63c572A66a428',
};

export const daiFtmLpContract = new Contract(
    DAIFTM.address,
    LPAPI,
    PROVIDER,
);

const FUSDTFTM = {
  address: '0x5965E53aa80a0bcF1CD6dbDd72e6A9b2AA047410',
};

export const fusdtFtmLpContract = new Contract(
    FUSDTFTM.address,
    LPAPI,
    PROVIDER,
);

const MIMFTM = {
  address: '0x6f86e65b255c9111109d2D2325ca2dFc82456efc',
};

export const mimFtmLpContract = new Contract(
    MIMFTM.address,
    LPAPI,
    PROVIDER,
);
