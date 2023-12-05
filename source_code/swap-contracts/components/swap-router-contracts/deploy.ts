delete require.cache[require.resolve('hardhat')];
import { ethers, run } from "hardhat";
import path from 'path';
import { readDeployment, writeDeployment, writeDeploymentArgs } from "../../utils";
import type { FactoryOptions } from "hardhat/types";

async function main() {
  const deployment = readDeployment();
  const { ButterFactory, NonfungiblePositionManager, WMNT } = deployment;

  if (!ButterFactory || !NonfungiblePositionManager || !WMNT) {
    throw new Error('ButterFactory, NonfungiblePositionManager, WMNT need to be in deployment.json');
  }
  const deploymentArgs: Record<string, any[]> = {};
  const signer = ethers.provider.getSigner();
  const ad = await signer.getAddress();
  console.log(`signer address is ${ad}`);
  let nonce = await ethers.provider.getTransactionCount(ad);
  console.log('nonce', nonce);

  async function recordDeployment(name: string, options?: FactoryOptions, ...args: any[]) {
    const _factory = await ethers.getContractFactory(name, options);
    const contract = await _factory.deploy(...args, {
      nonce: nonce++,
    });
    await contract.deployed();
    console.log(`${name} deployed to ${contract.address}`);
    
    // This doesn't work well
    // await run('verify:verify', {
    //   address: contract.address,
    //   constructorArguments: args,
    // });
    deployment[name] = contract.address;
    deploymentArgs[name] = args;
  }

  await recordDeployment(
    'SwapRouter02',
    undefined,
    "0x0000000000000000000000000000000000000000", // factory V2
    ButterFactory,
    NonfungiblePositionManager,
    WMNT,
  );

  writeDeployment(deployment);
  const parts = __dirname.split(path.sep);
  const component = parts[parts.length - 1];
  writeDeploymentArgs(component, deploymentArgs);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
