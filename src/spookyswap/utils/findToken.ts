import {WFTM, USDC, DAI, FUSDT, MIM} from '../static/tokens';

import {
  usdcFtmLpContract,
  daiFtmLpContract,
  fusdtFtmLpContract,
  mimFtmLpContract,
} from '../static/lpContracts';

export default function findToken(token) {
  let tokenObj;
  switch (token) {
    case 'WFTM':
      tokenObj = WFTM;
      break;
    case 'USDC':
      tokenObj = {token: USDC, contract: usdcFtmLpContract};
      break;
    case 'DAI':
      tokenObj = {token: DAI, contract: daiFtmLpContract};
      break;
    case 'FUSDT':
      tokenObj = {token: FUSDT, contract: fusdtFtmLpContract};
      break;
    case 'MIM':
      tokenObj = {token: MIM, contract: mimFtmLpContract};
      break;
    default:
      tokenObj = 'none';
  }

  return tokenObj;
}
