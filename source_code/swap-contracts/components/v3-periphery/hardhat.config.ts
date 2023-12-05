delete require.cache[require.resolve('hardhat')];
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-waffle'
import '@openzeppelin/hardhat-upgrades'
import 'hardhat-typechain'
import 'hardhat-watcher'

const CONSOLE_CYAN = '\x1b[96m';
const CONSOLE_NORMAL = '\x1b[0m';

function log(...message) {
  console.log(CONSOLE_CYAN, ...message, CONSOLE_NORMAL);
}
log('v3-periphery hardhat config');

const LOW_OPTIMIZER_COMPILER_SETTINGS = {
  version: '0.7.6',
  settings: {
    evmVersion: 'istanbul',
    optimizer: {
      enabled: true,
      runs: 2_000,
    },
    metadata: {
      bytecodeHash: 'none',
    },
  },
}

const LOWEST_OPTIMIZER_COMPILER_SETTINGS = {
  version: '0.7.6',
  settings: {
    evmVersion: 'istanbul',
    optimizer: {
      enabled: true,
      runs: 1_000,
    },
    metadata: {
      bytecodeHash: 'none',
    },
  },
}

const DEFAULT_COMPILER_SETTINGS = {
  version: '0.7.6',
  settings: {
    evmVersion: 'istanbul',
    optimizer: {
      enabled: true,
      runs: 1_000_000,
    },
    metadata: {
      bytecodeHash: 'none',
    },
  },
}

// const V3_CORE_SOLIDITY_SETTINGS = {
//   version: '0.7.6',
//   settings: {
//     optimizer: {
//       enabled: true,
//       runs: 800,
//     },
//     metadata: {
//       // do not include the metadata hash, since this is machine dependent
//       // and we want all generated code to be deterministic
//       // https://docs.soliditylang.org/en/v0.7.6/metadata.html
//       bytecodeHash: 'none',
//     },
//   },
// };

// const SOLIDITY_SETTINGS_BY_DIRECTORY = {
//   'v3-core': V3_CORE_SOLIDITY_SETTINGS,
// }
// const SOLIDITY_SETTINGS: Record<string, any> = {};

// for (const [folder, settings] of Object.entries(SOLIDITY_SETTINGS_BY_DIRECTORY)) {
//   const paths = globSync(`./contracts/${folder}/**/*.sol`);
//   for (const file of paths) {
//     SOLIDITY_SETTINGS[file] = settings;
//   }
// }

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

export default {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: false,
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    arbitrumRinkeby: {
      url: `https://arbitrum-rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    arbitrum: {
      url: `https://arbitrum-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    optimismKovan: {
      url: `https://optimism-kovan.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    optimism: {
      url: `https://optimism-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    mantleTestnet: {
      url: 'https://rpc.testnet.mantle.xyz',
      accounts: [DEPLOYER_PRIVATE_KEY],
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: {
      mantleTestnet: process.env.ETHERSCAN_API_KEY ?? 'not required',
    },
    customChains: [
      {
        network: 'mantleTestnet',
        chainId: 5001,
        urls: {
          apiURL: 'https://explorer.testnet.mantle.xyz/api',
          browserURL: 'https://explorer.testnet.mantle.xyz',
        }
      }
    ],
  },
  solidity: {
    compilers: [DEFAULT_COMPILER_SETTINGS],
    overrides: {
      'contracts/v3-periphery/NonfungiblePositionManager.sol': LOW_OPTIMIZER_COMPILER_SETTINGS,
      'contracts/v3-periphery/test/MockTimeNonfungiblePositionManager.sol': LOW_OPTIMIZER_COMPILER_SETTINGS,
      'contracts/v3-periphery/test/NFTDescriptorTest.sol': LOWEST_OPTIMIZER_COMPILER_SETTINGS,
      'contracts/v3-periphery/NonfungibleTokenPositionDescriptor.sol': LOWEST_OPTIMIZER_COMPILER_SETTINGS,
      'contracts/v3-periphery/libraries/NFTDescriptor.sol': LOWEST_OPTIMIZER_COMPILER_SETTINGS,
    },
  },
  watcher: {
    test: {
      tasks: [{ command: 'test', params: { testFiles: ['{path}'] } }],
      files: ['./test/**/*'],
      verbose: true,
    },
  },
}
