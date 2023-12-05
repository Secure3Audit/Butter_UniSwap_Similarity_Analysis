delete require.cache[require.resolve('hardhat')];
import { ethers, run } from "hardhat";
import fs from 'fs';
import path from 'path';
import { writeDeployment, writeDeploymentArgs } from "../../utils";

async function main() {
  const signer = ethers.provider.getSigner();
  const ad = await signer.getAddress();
  console.log(`signer address is ${ad}`);
  let nonce = await ethers.provider.getTransactionCount(ad);
  console.log('nonce', nonce);
  const _factory = await ethers.getContractFactory("ButterFactory");
  const ButterFactory = await _factory.deploy({
    nonce: nonce++,
  });
  await ButterFactory.deployed();
  // the constructor enables fee amounts 500,10; 3000,60; 10000,200
  console.log(
    `ButterFactory deployed to ${ButterFactory.address}`
  );
  // This doesn't work well
  // await run('verify:verify', {
  //   address: ButterFactory.address,
  //   constructorArguments: []
  // });
  writeDeployment({
    ButterFactory: ButterFactory.address,
    WMNT: '0xEa12Be2389c2254bAaD383c6eD1fa1e15202b52A', // TODO replace with env
  });
  const parts = __dirname.split(path.sep);
  const component = parts[parts.length - 1];
  writeDeploymentArgs(component, { ButterFactory: [] });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
