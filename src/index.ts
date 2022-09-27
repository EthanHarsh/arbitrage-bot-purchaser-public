/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
import express from 'express';
import 'dotenv/config';
import spookyStables from './spookyswap/stables';
import mongoose from 'mongoose';


const app = express();

app.use(express.json());

app.post('/', async function(req, res) {
  const body = req.body;

  console.log(`Request receieved with body: ${JSON.stringify(body)}`);
  console.log(`Starting purchase of ${body.buy} for ${body.sell}`);
  const purchaseResult = await spookyStables(body);

  res.status(204).json(purchaseResult);
});

const PORT:number = parseInt(process.env.PORT) || 7777;
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
  });
});
