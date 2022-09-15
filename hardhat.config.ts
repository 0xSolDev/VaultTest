import "@nomiclabs/hardhat-waffle";
import "solidity-coverage";

export default {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      timeout: 1000000,
      initialBaseFeePerGas: 0,
    },
  },
  solidity: {
    version: "0.8.16",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  mocha: {
    timeout: 2000000,
  },
};
