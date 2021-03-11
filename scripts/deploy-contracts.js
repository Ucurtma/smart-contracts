#!/usr/bin/env node

/**
 * Example usage
 * ./scripts/deploy-contracts.js -p 10 -w 1 -e 0 -t 0x31f1cfbbbd9ce6ee0f8d9c79828b0b099653daa0 -o 0xFb4BA4f9a0d80ffda8b11bbcDCD56a0eDd7729E2 --rinkeby
 */

const Web3 = require('web3');

const { toHex } = require('web3-utils');
const program = require('commander');
const deployedAddresses = require('../deployedAddresses.json');
const { networks } = require('../truffle-config.js');
const moment = require('moment');

const { DeploymentManager } = require('../main').contracts;

const waitTx = async promise => {
  const txReceipt = await promise;
  if (!txReceipt.status && txReceipt.status !== '0x1') {
    console.error(JSON.stringify(txReceipt, null, 2));
    throw new Error('transaction failed');
  }
  return txReceipt;
};

const toEpoch = input => {
  return moment(input).unix();
};

const toTimestamp = inputDays => {
  return parseInt(inputDays) * (24 * 60 * 60);
};

const toDays = input => {
  return input / (24 * 60 * 60);
};

const init = async () => {
  program
    .usage('[options]')
    .option('--ropsten', 'Use Ropsten instead of local development network')
    .option('--rinkeby', 'Use Rinkeby instead of local development network')
    .option('--kovan', 'Use Kovan instead of local development network')
    .option('--mainnet', 'Use Mainnet instead of local development network')
    .option('--avalanche_fuji', 'Use Avalanche Fuji instead of local development network')
    .requiredOption('-p, --payouts [n]', 'Number of payouts')
    .requiredOption('-w, --withdraw [n]', 'Withdraw payout period in days', 28)
    .requiredOption('-e, --endTime <n>', 'Campaign end time in days', 30)
    .requiredOption('-t, --tokenAddress <n>', 'Address of the token')
    .requiredOption('-o, --owner <n>', 'Owner of the contracts')
    .parse(process.argv);

  const networkName = program.ropsten
    ? 'ropsten'
    : program.mainnet
    ? 'mainnet'
    : program.rinkeby
    ? 'rinkeby'
    : program.kovan
    ? 'kovan'
    : program.avalanche_fuji
    ? 'avalanche_fuji'
    : 'development';

  const numberOfPayouts = program.payouts;
  const withdrawPeriod = toTimestamp(program.withdraw);
  const campaignEndTime = toEpoch(
    moment().add(parseInt(program.endTime), 'day')
  );
  const tokenAddress = program.tokenAddress;
  const owner = program.owner;

  console.log(
    `
  Config
  ------
  Network               : ${networkName}
  Number of Payouts     : ${numberOfPayouts}
  Withdraw Period       : ${toDays(withdrawPeriod)} days (${withdrawPeriod}) 
  Campaign End time     : ${moment(campaignEndTime).utc()} (${campaignEndTime})
  ERC20 Token Address   : ${tokenAddress}
  Contract Owner        : ${owner}
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
  } else if (program.avalanche_fuji) {
    provider = networks.avalanche_fuji.provider();
  }
  const web3 = new Web3(provider);

  const networkId = await web3.eth.net.getId();
  const { address: deployerAddress } =
    DeploymentManager.networks[networkId] || deployedAddresses[networkId];
  if (!deployerAddress) {
    throw new Error(
      'Unable to find address of Deployer contract on this network!'
    );
  }

  console.log(`Deployer: ${deployerAddress}`);

  const accounts = await web3.eth.getAccounts();
  const [account] = accounts;

  console.log(`Owner Account: ${account}`);

  const deploymentManager = new web3.eth.Contract(
    DeploymentManager.abi,
    deployerAddress
  );
  console.log(`
  Deploying new funding contract
  -------------------------------
  `);
  const tx = await waitTx(
    deploymentManager.methods
      .deploy(
        toHex(numberOfPayouts),
        toHex(withdrawPeriod),
        toHex(campaignEndTime),
        owner,
        tokenAddress,
        web3.currentProvider.addresses[0],
      )
      .send({ from: account, gas: 4000000 })
  );

  const {
    deployedAddress: newFundingContractAddress
  } = tx.events.NewFundingContract.returnValues;

  console.log(`
  Deployment successful 🎉 🎊
  -------------------------------
  `);
  console.log(`New fundingContract address: ${newFundingContractAddress}`);
};

init()
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(-1);
  });
