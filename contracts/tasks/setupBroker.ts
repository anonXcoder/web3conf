import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import fs from 'fs';

import EthCrypto from 'eth-crypto';

task("setup:ListBroker")
  .addParam("admin", "Broker factory contract address")
  .addParam("brokerFactoryAddr", "Broker factory contract address")
  .addParam("escrow", "Broker escrow address")
  .addParam("addr", "Broker address")
  .addParam("active", "Is broker active on listing")
  .addParam("minUsdt", "Min USDT the broker is allowed to trade")
  .addParam("maxUsdt", "Max USDT the broker is allowed to trade")
  .addParam("minInr", "Min INR the broker is allowed to trade")
  .addParam("maxInr", "Max INR the broker is allowed to trade")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const signer = new ethers.Wallet(taskArguments.admin, ethers.provider);
    console.log(signer);
    console.log('ready to run the task with args: ', taskArguments);
    const keyFile = `./walletKeys/${taskArguments.addr}.json`;
    if (!fs.existsSync(keyFile)){
    	throw(`Please generate keys first using: npx hardhat generate-keys ${taskArguments.addr}`);
    }
    const broker = JSON.parse(fs.readFileSync(keyFile, 'utf8'));
    console.log("Loaded broker keys: ", broker);

    const signers: SignerWithAddress[] = await ethers.getSigners();
    const brokerFactoryFactory: BrokerFactory__factory = <BrokerFactory__factory>await ethers.getContractFactory("BrokerFactory");
    const brokerFactory = await brokerFactoryFactory.attach(taskArguments.brokerFactoryAddr);
    console.log("BrokerFactory connected to: ", brokerFactory.address);

    let brokerData = {
      pubKey: broker.publicKey,
      escrow: taskArguments.escrow,
      addr: taskArguments.addr,
      active: taskArguments.active,
      limits: {
        minUsdt: taskArguments.minUsdt,
        maxUsdt: taskArguments.maxUsdt,
        minInr: taskArguments.minInr,
        maxInr: taskArguments.maxInr
      },
    }

    console.log("Broker data to list: ", brokerData);
    const tx = await brokerFactory.connect(signer).listBroker(brokerData, {gasPrice: 90275063317});
    const res = await tx.wait();
    console.log("Tx result: ", res);
  });
