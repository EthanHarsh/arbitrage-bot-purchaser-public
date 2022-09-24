import axios from 'axios';
export default async function tradeSupervisor(
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
