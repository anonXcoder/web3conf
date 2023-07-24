import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import type { ExchangeConfig } from "../../types/ExchangeConfig";
import type { ExchangeConfig__factory } from "../../types/factories/ExchangeConfig__factory";

task("deploy:ExchangeConfig")
  .addParam("deployer", "Deployer private key")
  .addParam("buyPrice", "USDT buy price in INR")
  .addParam("sellPrice", "USDT sell price in INR")
  .addParam("limitPerTx", "USDT limit per tx")
  .addParam("buyMinTime", "Min processing time for buying USDT")
  .addParam("buyMaxTime", "Max processing time for buying USDT")
  .addParam("sellMinTime", "Min processing time for selling USDT")
  .addParam("sellMaxTime", "Max processing time for selling USDT")
  .addVariadicPositionalParam("admins", "Exchange admins")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const signer = new ethers.Wallet(taskArguments.deployer, ethers.provider);
    console.log(signer);
    const processingTime = {
      buyMin: taskArguments.buyMinTime,
      buyMax: taskArguments.buyMaxTime,
      sellMin: taskArguments.sellMinTime,
      sellMax: taskArguments.sellMaxTime
    }
    const exchangeConfigFactory: ExchangeConfig__factory = <ExchangeConfig__factory>await ethers.getContractFactory("ExchangeConfig");
    const exchangeConfig: ExchangeConfig = <ExchangeConfig>await exchangeConfigFactory.connect(signer).deploy(taskArguments.admins, taskArguments.buyPrice, taskArguments.sellPrice, taskArguments.limitPerTx, processingTime);
    await exchangeConfig.deployed();
    console.log("ExchangeConfig deployed to: ", exchangeConfig.address);
  });

task("deploy:BrokerFactory")
  .addParam("deployer", "Deployer private key")
  .addParam("exchangeConfig", "Exchange config contract address")
  .addParam("usdtAddress", "Contract address for USDT")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const signer = new ethers.Wallet(taskArguments.deployer, ethers.provider);
    console.log(signer);
    const brokerFactoryFactory: BrokerFactory__factory = <BrokerFactory__factory>await ethers.getContractFactory("BrokerFactory");
    const brokerFactory: BrokerFactory = <BrokerFactory>await brokerFactoryFactory.connect(signer).deploy(taskArguments.exchangeConfig, taskArguments.usdtAddress);
    await brokerFactory.deployed();
    console.log("BrokerFactory deployed to: ", brokerFactory.address);
  });
