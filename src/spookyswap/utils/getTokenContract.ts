import {ERC20ABI} from '../static/contractAbis';
import {Contract} from 'ethers';
import PROVIDER from '../static/provider';

export default function getTokenContract(token) {
  const contract = new Contract(token.address, ERC20ABI, PROVIDER);
  return contract;
}
