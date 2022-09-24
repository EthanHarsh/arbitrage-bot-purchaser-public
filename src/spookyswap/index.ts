import {Wallet} from 'ethers';

import {saveTx} from '../database';
import {findToken, getPair, getTokenContract} from './utils';

import {WFTM} from './static/tokens';

import {tradeSupervisor, makeTrade} from '../modules';

import PROVIDER from './static/provider';

export default async function spookyStables(orderObj) {
  const wallet = new Wallet(process.env.FANTOM_PRIVATE_KEY, PROVIDER);

  const sell = findToken(orderObj.sell);
  const buy = findToken(orderObj.buy);
  const sellContract = getTokenContract(sell.token);
  const buyContract = getTokenContract(buy.token);
  const sellDecimals = await sellContract.decimals();
  const buyDecimals = await buyContract.decimals();


  let sellPair;
  const sellRoute = {
    ftm: '',
    stable: '',
  };
  if (orderObj.sell === 'DAI' || orderObj.sell === 'MIM') {
    sellPair = await getPair(
        sell.contract,
        `${orderObj.sell}-WFTM LP`,
        WFTM,
        sell.token,
        WFTM,
        orderObj.sell,
    );
    sellRoute.ftm = sellPair.route.path[0].address;
    sellRoute.stable = sellPair.route.path[1].address;
  } else {
    sellPair = await getPair(
        sell.contract,
        `${orderObj.sell}-WFTM LP`,
        sell.token,
        WFTM,
        WFTM,
        orderObj.sell,
    );
    sellRoute.ftm = sellPair.route.path[0].address;
    sellRoute.stable = sellPair.route.path[1].address;
  }

  let buyPair;
  const buyRoute = {
    ftm: '',
    stable: '',
  };
  if (orderObj.buy === 'DAI' || orderObj.buy === 'MIM') {
    buyPair = await getPair(
        buy.contract,
        `${orderObj.buy}-WFTM LP`,
        WFTM,
        buy.token,
        buy.token,
        orderObj.buy,
    );
    buyRoute.ftm = buyPair.route.path[1].address;
    buyRoute.stable = buyPair.route.path[0].address;
  } else {
    buyPair = await getPair(
        buy.contract,
        `${orderObj.buy}-WFTM LP`,
        buy.token,
        WFTM,
        buy.token,
        orderObj.buy,
    );
    buyRoute.ftm = buyPair.route.path[1].address;
    buyRoute.stable = buyPair.route.path[0].address;
  }

  // Add prices to axios call to determine final sale amount
  const sellPrice =
    parseFloat(sellPair.ftmPrice) * parseFloat(sellPair.stablePrice);
  const buyPrice =
    parseFloat(buyPair.ftmPrice) * parseFloat(buyPair.stablePrice);
  const orderFlag = orderObj.flag;
  const orderTradeAmount = orderObj.tradeAmount;
  const amountObj = await tradeSupervisor(
      orderObj,
      wallet,
      {sellDecimals, buyDecimals},
      sellPrice,
      buyPrice,
      orderFlag,
      orderTradeAmount,
  );

  const sellAmount = amountObj.sellAmount;
  const buyAmount = amountObj.buyAmount;
  const sellAmountWei = amountObj.sellAmountWei;
  const buyAmountWei = amountObj.buyAmountWei;
  const flag = amountObj.flag;

  console.log(`Sell amount => ${sellAmount}`);
  console.log(`Buy amount => ${buyAmount}`);
  console.log(`Sell amount wei => ${sellAmountWei.toString()}`);
  console.log(`Buy amount wei => ${buyAmountWei.toString()}`);
  console.log(`Flag => ${flag}`);

  if (flag === true) {
    const finishedTx = await makeTrade(
        sellRoute,
        buyRoute,
        wallet,
        sellAmountWei,
        buyAmountWei,
        orderObj,
    );
    if (!finishedTx) {
      return false;
    }
    const action = `Trade ${orderObj.sell} for ${orderObj.buy}`;
    const sell = orderObj.sell;
    const buy = orderObj.buy;
    const sellPriceFTM = sellPair.stablePrice;
    const buyPriceFTM = buyPair.stablePrice;
    const sellPriceUSD = sellPair.stablePrice * sellPair.ftmPrice;
    const buyPriceUSD = buyPair.stablePrice * buyPair.ftmPrice;
    const date = new Date();
    const txData = {
      action,
      sell,
      buy,
      sellPriceFTM,
      buyPriceFTM,
      sellPriceUSD,
      buyPriceUSD,
      sellNumberofTokens: sellAmount,
      buyNumberofTokens: buyAmount,
      time: date.getTime(),
      humanTime: date.toUTCString(),
      swing_complete: false,
      exchange: 'Spookyswap',
      finishedTx,
    };
    await saveTx(txData);
  }
}
