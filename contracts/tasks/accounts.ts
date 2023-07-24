import { Signer } from "@ethersproject/abstract-signer";
import { task } from "hardhat/config";
import fs from 'fs';


import EthCrypto from 'eth-crypto';

task("accounts", "Prints the list of accounts", async (_taskArgs, hre) => {
  const accounts: Signer[] = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(await account.getAddress());
  }
});

task("generate-keys")
  .addVariadicPositionalParam("userAddress", "User wallet address to generate keys for")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {

    let dir = './walletKeys';
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }

    for (let i=0; i<taskArguments.userAddress.length; i++) {
      console.log('ready to run the task with args: ', taskArguments);
      let userKeys = EthCrypto.createIdentity();
      console.log("Generated user keys: ", userKeys);

      let file = `${dir}/${taskArguments.userAddress[i]}.json`;
      if (!fs.existsSync(file)){
        fs.writeFileSync(file, JSON.stringify(userKeys), function(err, result) {
          console.log('error, res', err, res);
        });
      }
    }
  });

task("generate-wallet")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {

    let dir = './walletKeys';
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }

    let userKeys = EthCrypto.createIdentity();
    console.log("Generated user keys: ", userKeys);

    let file = `${dir}/${userKeys.address}.json`;
    if (!fs.existsSync(file)){
      fs.writeFileSync(file, JSON.stringify(userKeys), function(err, result) {
        console.log('error, res', err, res);
      });
    }
  });

task("send-eth")
  .addParam("toAddress", "To address")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    console.log(await ethers.provider.getBalance(signers[0].address));

     await signers[0].sendTransaction({
      to: taskArguments.toAddress,
      value: ethers.utils.parseEther("1.0"), // Sends exactly 1.0 ether
    });

   console.log(await ethers.provider.getBalance(taskArguments.toAddress));

  });

task("deploy-erc20")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const weiAmount = (await deployer.getBalance()).toString();
    
    console.log("Account balance:", (await ethers.utils.formatEther(weiAmount)));

    // make sure to replace the "GoofyGoober" reference with your own ERC-20 name!
    const Token = await ethers.getContractFactory("GoofyGoober");
    const token = await Token.deploy();

    console.log("Token address:", token.address);
  });

task("transfer-erc20")
  .addParam("token", "Token address")
  .addParam("sendTo", "To address")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const tokenFactory: GoofyGoober__factory = <GoofyGoober__factory>await ethers.getContractFactory("GoofyGoober");
    const token = await tokenFactory.attach(taskArguments.token);
    console.log("BrokerFactory connected to: ", token.address);
    console.log("1", await token.balanceOf(taskArguments.sendTo));
    let tx = await token.transfer(taskArguments.sendTo, "10000000000");
    await tx.wait();
    console.log("2", await token.balanceOf(taskArguments.sendTo));
    
    console.log("Tx result: ", tx);

  });
