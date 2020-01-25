const Web3 = require('web3');
const Contract = require('@truffle/contract');
const { infuraKey } = require('../.deployment.js');
const { argv } = require('yargs');

const {
  DeploymentManager,
  BiliraFundingContractDeployer,
  ERC20FundingContract,
  Token
} = require('../contracts');

const init = async () => {
  const web3 = new Web3(`https://${argv.network}.infura.io/v3/${infuraKey}`);
};

init();
