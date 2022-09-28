import axios from 'axios';
import {findToken, getTokenContract} from '../spookyswap/utils';

export default async function tradeSupervisor(
    orderObj,
    wallet,
    decimals,
    sellPrice,
    buyPrice,
    orderFlag,
    orderTradeAmount,
) {
  // Add error handling
  const tokenBalanceArr = await balanceArr(orderObj, wallet);
  // Add error handling
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
  // Add error handling
  const fusdtContract = await getTokenContract(fusdtToken.token);
  // Add error handling
  const fusdtBalance = await fusdtContract.balanceOf(wallet.address);
  const tokenBalanceArr = [{token: 'FUSDT', balance: fusdtBalance}];

  // USDC
  const usdcToken = findToken('USDC');
  // Add error handling
  const usdcContract = await getTokenContract(usdcToken.token);
  // Add error handling
  const usdcBalance = await usdcContract.balanceOf(wallet.address);
  tokenBalanceArr.push({token: 'USDC', balance: usdcBalance});

  // DAI
  const daiToken = findToken('DAI');
  // Add error handling
  const daiContract = await getTokenContract(daiToken.token);
  // Add error handling
  const daiBalance = await daiContract.balanceOf(wallet.address);
  tokenBalanceArr.push({token: 'DAI', balance: daiBalance});

  // MIM
  const mimToken = findToken('MIM');
  // Add error handling
  const mimContract = await getTokenContract(mimToken.token);
  // Add error handling
  const mimBalance = await mimContract.balanceOf(wallet.address);
  tokenBalanceArr.push({token: 'MIM', balance: mimBalance});

  return tokenBalanceArr;
}
