/**
 * Example usage
 * npx hardhat run --network fuji scripts/deploy-deployment-manager.js
 */

const hre = require('hardhat');
const { saveDeployedAddr } = require('./utils');

const main = async () => {
    const FundingContractDeployer = await hre.ethers.getContractFactory('FundingContractDeployer');
    const fundingContractDeployer = await FundingContractDeployer.deploy();
    await fundingContractDeployer.deployed();

    console.log('FundingContractDeployer deployed to:', fundingContractDeployer.address);

    const DeploymentManager = await hre.ethers.getContractFactory('DeploymentManager');
    const deploymentManager = await DeploymentManager.deploy(fundingContractDeployer.address);
    await deploymentManager.deployed();

    console.log('DeploymentManager deployed to:', deploymentManager.address);

    saveDeployedAddr(hre.network.name, 'FundingContractDeployer', fundingContractDeployer.address);
    saveDeployedAddr(hre.network.name, 'DeploymentManager', deploymentManager.address);
};

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
