delete require.cache[require.resolve('hardhat')];
import { ethers, run } from "hardhat";
import path from 'path';
import { readDeployment, writeDeployment, writeDeploymentArgs } from "../../utils";
import type { FactoryOptions } from "hardhat/types";

async function main() {
  const deployment = readDeployment();
  const { ButterFactory, WMNT } = deployment;
  if (!ButterFactory) {
    throw new Error('ButterFactory not found in deployment.json');
  }
  if (!WMNT) {
    throw new Error(`WMNT not found in deployment.json`);
  }
  const signer = ethers.provider.getSigner();
  const ad = await signer.getAddress();
  console.log(`signer address is ${ad}`);
  let nonce = await ethers.provider.getTransactionCount(ad);
  console.log('nonce', nonce);
  const deploymentArgs: Record<string, any[]> = {};
  async function recordDeployment(name: string, options?: FactoryOptions, ...args: any[]) {
    const _factory = await ethers.getContractFactory(name, options);
    // it is so sad we have to pass in the nonce manually
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

  await recordDeployment('SwapRouter', undefined, ButterFactory, WMNT);
  await recordDeployment('NFTDescriptor', undefined);
  await recordDeployment(
    'NonfungibleTokenPositionDescriptor',
    {
      libraries: {
        NFTDescriptor: deployment['NFTDescriptor'],
      },
    },
    WMNT,
    '0x4d4e540000000000000000000000000000000000000000000000000000000000' // bytes32 of string 'MNT'
  );
  await recordDeployment(
    'NonfungiblePositionManager',
    undefined,
    ButterFactory,
    WMNT,
    deployment['NonfungibleTokenPositionDescriptor']
  );

  // const NonfungibleTokenPositionDescriptor = await upgrades.deployProxy(
  //   _descriptorFactory,
  //   [
  //     '0xEa12Be2389c2254bAaD383c6eD1fa1e15202b52A',
  //     '0x4d4e540000000000000000000000000000000000000000000000000000000000'
  //   ]
  // );

  await recordDeployment('QuoterV2', undefined, ButterFactory, WMNT);
  await recordDeployment('Quoter', undefined, ButterFactory, WMNT);
  await recordDeployment(
    'V3Migrator',
    undefined,
    ButterFactory,
    WMNT,
    deployment['NonfungiblePositionManager']
  );
  await recordDeployment('ButterInterfaceMulticall');
  await recordDeployment('Multicall2');
  await recordDeployment('TickLens');

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
