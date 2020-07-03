#!/usr/bin/env node

const Web3 = require("web3");

const program = require("commander");
const { networks } = require("../truffle-config.js");
const { Contract } = require("web3-eth-contract");

const {
  contracts: { FundingManagerContract },
} = require("../main");

const waitTx = async (promise) => {
  const txReceipt = await promise;
  if (!txReceipt.status && txReceipt.status !== "0x1") {
    console.error(JSON.stringify(txReceipt, null, 2));
    throw new Error("transaction failed");
  }
  return txReceipt;
};

const init = async () => {
  program
    .usage("[options]")
    .option("--ropsten", "Use Ropsten instead of local development network")
    .option("--rinkeby", "Use Rinkeby instead of local development network")
    .option("--kovan", "Use Kovan instead of local development network")
    .option("--mainnet", "Use Mainnet instead of local development network")
    .requiredOption("-a, --address", "address of the ManagerContract")
    .parse(process.argv);

  const networkName = program.ropsten
    ? "ropsten"
    : program.mainnet
    ? "mainnet"
    : program.rinkeby
    ? "rinkeby"
    : program.kovan
    ? "kovan"
    : "development";

  const deployedAddress = program.args[0];

  console.log(
    `
  Config
  ------
  Network               : ${networkName}
  Deployed Address      : ${deployedAddress}
    `
  );

  let provider = new Web3.providers.HttpProvider(
    `http://${networks.development.host}:${networks.development.port}`
  );
  if (program.ropsten) {
    provider = networks.ropsten.provider();
  } else if (program.rinkeby) {
    provider = networks.rinkeby.provider();
  } else if (program.kovan) {
    provider = networks.kovan.provider();
  } else if (program.mainnet) {
    provider = networks.mainnet.provider();
  }
  const web3 = new Web3(provider);

  const accounts = await web3.eth.getAccounts();
  const [account] = accounts;

  console.log(`Owner Account: ${account}`);

  const managerContract = new web3.eth.Contract(
    FundingManagerContract.abi,
    deployedAddress,
    {
      from: account,
    }
  );

  console.log(`
  Reading the contracts
  -------------------------------
  `);
  const campaigns = [];
  for (let i = 0; i < 20; i++) {
    try {
      const result = await managerContract.methods
        .getCampaign(i)
        .call({ from: account });
      if (result && result[1]) {
        campaigns.push(result[1]);
      }
    } catch (e) {
      break;
    }
  }
  console.log(`
      Total Number of Contracts   : ${campaigns.length + 1}
      ----------------------------
      `);
  console.log(JSON.stringify(campaigns));
};
init()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(-1);
  });
