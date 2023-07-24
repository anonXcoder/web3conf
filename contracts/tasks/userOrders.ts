import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import fs from 'fs';

import EthCrypto from 'eth-crypto';

task("setup:AcceptBuyOrder")
  .addParam("brokerFactoryAddr", "Broker factory contract address")
  .addParam("orderId", "User public key")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    console.log('ready to place order with args: ', taskArguments);
    const signers: SignerWithAddress[] = await ethers.getSigners();
    console.log('signer used: ', signers[3]);
    const brokerFactoryFactory: BrokerFactory__factory = <BrokerFactory__factory>await ethers.getContractFactory("BrokerFactory");
    const brokerFactory = await brokerFactoryFactory.attach(taskArguments.brokerFactoryAddr);
    console.log("BrokerFactory connected to: ", brokerFactory.address);
    const order = await brokerFactory.orders(taskArguments.orderId);

    console.log("check order data", order);

    const keyFile = `./walletKeys/${order.broker}.json`;
    if (!fs.existsSync(keyFile)){
    	throw(`Please generate keys first using: npx hardhat generate-keys ${taskArguments.addr}`);
    }
    const broker = JSON.parse(fs.readFileSync(keyFile, 'utf8'));
    let brokerWallet = new ethers.Wallet(broker.privateKey, ethers.provider);

    console.log("provider: ", ethers.provider);


    const secretMessage = "prtkkotak@ybl";
  	let signature = EthCrypto.sign(
  	    broker.privateKey,
  	    EthCrypto.hash.keccak256(secretMessage)
  	);

  	let payload = {
  	    message: secretMessage,
  	    signature
  	};
  	let encrypted = await EthCrypto.encryptWithPublicKey(
  	    order.pubkey,
  	    JSON.stringify(payload)
  	);
  	let encryptedUpi = EthCrypto.cipher.stringify(encrypted);

  	console.log(encryptedUpi);

    const tx = await brokerFactory.connect(brokerWallet).acceptBuyOrder(taskArguments.orderId, encryptedUpi);
    const res = await tx.wait();
    console.log("Tx result: ", res);
  });

  task("setup:CompleteBuyOrder")
  .addParam("brokerFactoryAddr", "Broker factory contract address")
  .addParam("orderId", "User public key")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    console.log('ready to place order with args: ', taskArguments);
    const signers: SignerWithAddress[] = await ethers.getSigners();
    console.log('signer used: ', signers[3]);
    const brokerFactoryFactory: BrokerFactory__factory = <BrokerFactory__factory>await ethers.getContractFactory("BrokerFactory");
    const brokerFactory = await brokerFactoryFactory.attach(taskArguments.brokerFactoryAddr);
    console.log("BrokerFactory connected to: ", brokerFactory.address);

    const order = await brokerFactory.orders(taskArguments.orderId);
    console.log("check order data", order);

    const keyFile = `./walletKeys/${order.broker}.json`;
    if (!fs.existsSync(keyFile)){
      throw(`Please generate keys first using: npx hardhat generate-keys ${taskArguments.addr}`);
    }
    const broker = JSON.parse(fs.readFileSync(keyFile, 'utf8'));
    let brokerWallet = new ethers.Wallet(broker.privateKey, ethers.provider);

    const tx = await brokerFactory.connect(brokerWallet).completeOrder(taskArguments.orderId);
    const res = await tx.wait();
    console.log("Tx result: ", res);
  });
