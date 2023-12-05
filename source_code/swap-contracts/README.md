# Butter DEX Contracts

This repository contains the smart contracts for the Butter DEX.

## Local deployment

In order to deploy this code to a local testnet, you should install the npm package
`@uniswap/v3-periphery`
and import bytecode imported from artifacts located at
`@uniswap/v3-periphery/artifacts/contracts/*/*.json`.
For example:

```typescript
import {
  abi as SWAP_ROUTER_ABI,
  bytecode as SWAP_ROUTER_BYTECODE,
} from '@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json'

// deploy the bytecode
```

This will ensure that you are testing against the same bytecode that is deployed to
mainnet and public testnets, and all Uniswap code will correctly interoperate with
your local deployment.

## Remote deployment

First, you should verify two things:

1. The `POOL_INIT_CODE_HASH` in `components/swap-router-contracts/@butter/v3-periphery/contracts/libraries/PoolAddress.sol`. You can verify this by calling ethers.utils.keccak256() on the `bytecode` of ButterPool.
2. The various token contract addresses in `components/v3-periphery/contracts/NonfungibleTokenPositionDescriptor.sol`.

Deploy and verify everything to Mantle testnet at once:

```
export DEPLOYER_PRIVATE_KEY=your private key
yarn deploy:all
```

## Using solidity interfaces

The Uniswap v3 periphery interfaces are available for import into solidity smart contracts
via the npm artifact `@uniswap/v3-periphery`, e.g.:

```solidity
import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';

contract MyContract {
  ISwapRouter router;

  function doSomethingWithSwapRouter() {
    // router.exactInput(...);
  }
}

```
