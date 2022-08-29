import {providers} from 'ethers';

const PROVIDER = new providers.JsonRpcProvider({
  url: process.env.FANTOM_RPC,
  // @ts-ignore
  accounts: [`${process.env.FANTOM_PRIVATE_KEY}`],
});

export default PROVIDER;
