import fs from 'fs';

import { ethers, run } from "hardhat";
import type { FactoryOptions } from "hardhat/types";
import { readDeployment, writeDeployment, writeDeploymentArgs } from './utils';

function sleep(seconds: number) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function main() {
  const deployment = readDeployment();
  const { WMNT, ButterFactory } = deployment;
  if (!WMNT || !ButterFactory) {
    throw new Error(`WMNT and ButterFactory must be in addresses.json`);
  }
  console.log('WMNT', WMNT);
  console.log('ButterFactory', ButterFactory);
  const signer = ethers.provider.getSigner();
  const ad = await signer.getAddress();
  console.log(`signer address is ${ad}`);
  let nonce = await ethers.provider.getTransactionCount(ad);
  console.log('nonce', nonce);

  const deploymentArgs: Record<string, any[]> = {};
  async function recordDeployment(name: string, options: FactoryOptions = undefined, ...args: any[]) {
    const _factory = await ethers.getContractFactory(name, options);
    console.log(`${name} Got contract factory. Deploying contract...`);
    const contract = await _factory.deploy(...args);
    console.log('Contract deployment submitted. Waiting for contract deployment confirmation...');
    await contract.deployed();
    console.log(`${name} deployed to ${contract.address}`);
    // i think we have better luck verifying these contracts after sleeping for a bit
    // maybe the explorer hasn't indexed the contracts yet
    await sleep(10);
    try {
        // the UniversalRouter contract verification can take a while (~60s)
      await run('verify:verify', {
        address: contract.address,
        constructorArguments: args,
      });
    } catch (e) {
      // sometimes, if contract's bytecode matches an existing contract, verification will fail.
      // but it's only sometimes...
      console.error('Error in contract verification', e);
      // try again
      await sleep(5);
      try {
        await run('verify:verify', {
          address: contract.address,
          constructorArguments: args,
        });
      } catch (e2) {
        console.error('Error in contract verification second attempt', e);
      }
    }
    deployment[name] = contract.address;
    deploymentArgs[name] = args;
  }

  await recordDeployment('Permit2');
  // Not sure why deploying UnsupportedProtocol fails
  // console.log('finished deploying Permit2. now deploying UnsupportedProtocol');
  // await recordDeployment('UnsupportedProtocol');
  // mantle mainnet UnsupportedProtocol: 0x14D2b0a26eb0512693f29d9B80B0B15e937b8f65
  deployment['UnsupportedProtocol'] = process.env.UNSUPPORTED_PROTOCOL;
  deploymentArgs['UnsupportedProtocol'] = [];

  const universalRouterArgs = {
    permit2: deployment['Permit2'],
    weth9: WMNT,
    seaportV1_5: deployment['UnsupportedProtocol'],
    seaportV1_4: deployment['UnsupportedProtocol'],
    openseaConduit: deployment['UnsupportedProtocol'],
    nftxZap: deployment['UnsupportedProtocol'],
    x2y2: deployment['UnsupportedProtocol'],
    foundation: deployment['UnsupportedProtocol'],
    sudoswap: deployment['UnsupportedProtocol'],
    elementMarket: deployment['UnsupportedProtocol'],
    nft20Zap: deployment['UnsupportedProtocol'],
    cryptopunks: deployment['UnsupportedProtocol'],
    looksRareV2: deployment['UnsupportedProtocol'],
    routerRewardsDistributor: deployment['UnsupportedProtocol'],
    looksRareRewardsDistributor: deployment['UnsupportedProtocol'],
    looksRareToken: deployment['UnsupportedProtocol'],
    v2Factory: deployment['UnsupportedProtocol'],
    v3Factory: ButterFactory,
    pairInitCodeHash: ethers.utils.formatBytes32String(''),
    // TODO: replace poolInitCodeHash if it has changed
    poolInitCodeHash: '0xc7d06444331e4f63b0764bb53c88788882395aa31961eed3c2768cc9568323ee',
  };
  await recordDeployment('UniversalRouter', undefined, universalRouterArgs);
  writeDeployment(deployment);
  writeDeploymentArgs('universal-router', deploymentArgs);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
