
import {TokenAmount, Route, Pair} from '@uniswap/sdk';
export default async function getPair(contract, lpName, token0, token1, outToken, stableName) {
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
