# arbitrage-bot-purchaser-public
_Arbitrage Bot Purchasing Microservice_

![Typescript.js Badge](https://img.shields.io/badge/JavaScript-Typescript-green) ![Vue Badge](https://img.shields.io/badge/Framework-VUE-green)

## Description

This is a token purchasing microservice for the DeFi arbitrage bot. This service uses Typescript, Express.js, Node.js, Mongoose, Uniswap SDK, and Ethers.js, all of which are Javascript frameworks. When purchasing tokens, an order request is received, the request is checked for purchasing requirements,and the purchase is routed and executed if the requirements are fulfilled.

## Quick Start

### Using Docker
```
sudo docker build . -t purchase-service
```

### Using NPM - Production Start
#### Install Dependencies
```
npm run install
```

#### Build
```
npm run build
```

#### Start Command
```
npm run start
```
## Development
### Dev Container
Activate Development container using your prefered IDE.
### Using NPM - Development Start
#### Start for Development - _Nodemon_
```
npm run devStart
```