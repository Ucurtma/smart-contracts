/**
 * Example usage
 * PAYOUTS=10 WITHDRAW=20 ENDTIME=25 TOKEN=0x61C806e43cDf8ad45d2FfeFDc92977ddc7f0f69B OWNER=0x4D4d6B3b72731269Cf7f480F47c55C6d2ba83d16 npx hardhat run --network fuji scripts/deploy-funding-contract.js
 */

const hre = require('hardhat');
const web3 = require('web3').default;
const moment = require('moment');
const { getDeployedAddr } = require('./utils');


const toEpoch = input => {
    return moment(input).unix();
};

const toTimestamp = inputDays => {
    return parseInt(inputDays) * (24 * 60 * 60);
};

const main = async () => {
    const DeploymentManager = await hre.ethers.getContractFactory('DeploymentManager');
    const deploymentManager = await DeploymentManager.attach(getDeployedAddr(hre.network.name, 'DeploymentManager'));
    const amountPerPayment = 0;

    const tx = await deploymentManager.functions.deploy(
        process.env.PAYOUTS,
        toTimestamp(process.env.WITHDRAW),
        toEpoch(moment().add(parseInt(process.env.ENDTIME), 'day')),
        amountPerPayment,
        process.env.OWNER,
        process.env.TOKEN,
    );
    const receipt = await tx.wait();

    console.log('FundingContract deployed to', receipt.events[0].args.deployedAddress);
};

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });