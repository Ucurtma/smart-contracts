const hre = require('hardhat');
const { getDeployedAddr } = require('./utils');

const main = async (listOfOwners) => {
    const DeploymentManager = await hre.ethers.getContractFactory('DeploymentManager');
    const ERC20FundingContract = await hre.ethers.getContractFactory('ERC20FundingContract');
    const deploymentManager = await DeploymentManager.attach(getDeployedAddr(hre.network.name, 'DeploymentManager'));

    const [owner] = await deploymentManager.functions.owner();
    let count = await deploymentManager.functions.contractsCount(owner);
    count = parseInt(count.toString());
    const whoOwnContracts = [];
    for (let i = 0; i < count; i++) {
        const [, deployedContractAddress] = await deploymentManager.functions.deployedContracts(owner, i);
        const deployedContract = await ERC20FundingContract.attach(deployedContractAddress);
        const [ownerContract] = await deployedContract.functions.owner();
        const item = listOfOwners.filter(contract => contract.address === ownerContract.toString()).map(c => {
            return {
                name: c.name,
                address: deployedContractAddress
            };
        });
        whoOwnContracts.push(item);
    }

    console.log(whoOwnContracts);
};

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
