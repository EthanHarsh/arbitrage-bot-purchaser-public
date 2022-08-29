import mongoose from 'mongoose';
const transactionSchema = new mongoose.Schema({
  action: String,
  sell: String,
  buy: String,
  sellPriceFTM: Number,
  buyPriceFTM: Number,
  sellPriceUSD: Number,
  buyPriceUSD: Number,
  sellNumberofTokens: Number,
  buyNumberofTokens: Number,
  time: Number,
  humanTime: String,
  swing_complete: Boolean,
  exchange: String,
  finishedTx: Object,
});

const TxModel = mongoose.model('executed-transaction', transactionSchema);

export default async function saveTx(tx) {
  const transaction = new TxModel(tx);
  const savedTx = await transaction.save();
  return savedTx;
};
