import {Contract, utils, Wallet} from 'ethers';
import {TokenAmount, Route, Pair} from '@uniswap/sdk';
import axios from 'axios';

import {saveTx} from '../database';
import {findToken} from './utils';

import {WFTM, usdc} from './static/tokens';

import {ERC20ABI, ROUTER} from './static/contractAbis';

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
/*
function findToken(token) {
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
} */

function getTokenContract(token) {
  const contract = new Contract(token.address, ERC20ABI, PROVIDER);
  return contract;
}

async function getPair(contract, lpName, token0, token1, outToken, stableName) {
  const reserves = await contract.getReserves();
  const pair = new Pair(
      new TokenAmount(token0, reserves[0]),
      new TokenAmount(token1, reserves[1]),
  );
  const route = new Route([pair], outToken);
  const ftmPrice = route.midPrice.toSignificant(6);
  const stablePrice = route.midPrice.invert().toSignificant(6);
  console.log(`${lpName} => Buy price: ${ftmPrice}`);
  console.log(`${lpName} => Sell price: ${stablePrice}`);

  return {
    ftmPrice,
    stablePrice,
    stableName,
    pair,
    route,
    reserves,
  };
}

async function tradeSupervisor(
    orderObj,
    wallet,
    decimals,
    sellPrice,
    buyPrice,
    orderFlag,
    orderTradeAmount,
) {
  const tokenBalanceArr = await balanceArr(orderObj, wallet);
  const data = await axios
      .post('http://127.0.0.1:9999', {
        tokenBalanceArr,
        buy: orderObj.buy,
        sell: orderObj.sell,
        sellPrice,
        buyPrice,
        orderFlag,
        orderTradeAmount,
      })
      .catch((err) => {
        console.error(err);
      });
  // @ts-ignore
  const {sellAmount, buyAmount, flag, sellAmountWei, buyAmountWei} = data.data;
  return {sellAmount, buyAmount, flag, sellAmountWei, buyAmountWei};
}

async function balanceArr(orderObj, wallet) {
  // FUSDT
  const fusdtToken = findToken('FUSDT');
  const fusdtContract = await getTokenContract(fusdtToken.token);
  const fusdtBalance = await fusdtContract.balanceOf(wallet.address);
  const tokenBalanceArr = [{token: 'FUSDT', balance: fusdtBalance}];

  // USDC
  const usdcToken = findToken('USDC');
  const usdcContract = await getTokenContract(usdcToken.token);
  const usdcBalance = await usdcContract.balanceOf(wallet.address);
  tokenBalanceArr.push({token: 'USDC', balance: usdcBalance});

  // DAI
  const daiToken = findToken('DAI');
  const daiContract = await getTokenContract(daiToken.token);
  const daiBalance = await daiContract.balanceOf(wallet.address);
  tokenBalanceArr.push({token: 'DAI', balance: daiBalance});

  // MIM
  const mimToken = findToken('MIM');
  const mimContract = await getTokenContract(mimToken.token);
  const mimBalance = await mimContract.balanceOf(wallet.address);
  tokenBalanceArr.push({token: 'MIM', balance: mimBalance});

  return tokenBalanceArr;
}

async function makeTrade(
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
  const feeData = await PROVIDER.getFeeData();

  const tx = await spookyRouter.swapExactTokensForTokens(
      sellAmountWei,
      buyAmountWei,
      pathArr,
      wallet.address,
      Math.floor(Date.now() / 1000) + 60 * 20,
      feeData,
  );

  const finishedTx = await tx.wait()
      .catch((err) => {
        console.error(err);
        return false;
      });
  return finishedTx;
}
