import {Contract, utils} from 'ethers';

import {usdc} from '../spookyswap/static/tokens';

import {ROUTER} from '../spookyswap/static/contractAbis';

import PROVIDER from '../spookyswap/static/provider';

export default async function makeTrade(
    sellRoute,
    buyRoute,
    wallet,
    sellAmountWei,
    buyAmountWei,
    orderObj,
) {
  const spookyRouter = new Contract(
      utils.getAddress('0xf491e7b69e4244ad4002bc14e878a34207e38c29'),
      ROUTER,
      wallet._signer,
  );

  let pathArr = [];
  if (
    orderObj.buy === 'FUSDT' ||
      (orderObj.sell === 'FUSDT' &&
        orderObj.buy !== 'USDC' &&
        orderObj.sell !== 'USDC')
  ) {
    pathArr = [
      utils.getAddress(sellRoute.stable),
      utils.getAddress(usdc.address),
      utils.getAddress(buyRoute.stable),
    ];
  } else if (orderObj.buy === 'MIM' || orderObj.sell === 'MIM') {
    pathArr = [
      utils.getAddress(sellRoute.stable),
      utils.getAddress(sellRoute.ftm),
      utils.getAddress(buyRoute.stable),
    ];
  } else {
    pathArr = [
      utils.getAddress(sellRoute.stable),
      utils.getAddress(buyRoute.stable),
    ];
  }
  console.log(`Path: ${pathArr}`);
  // Add error handling
  const feeData = await PROVIDER.getFeeData();
  // Add error handling
  const tx = await spookyRouter.swapExactTokensForTokens(
      sellAmountWei,
      buyAmountWei,
      pathArr,
      wallet.address,
      Math.floor(Date.now() / 1000) + 60 * 20,
      feeData,
  );
  // Add error handling
  const finishedTx = await tx.wait()
      .catch((err) => {
        console.error(err);
        return false;
      });
  return finishedTx;
};
