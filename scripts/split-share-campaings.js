const hre = require('hardhat');
const { getDeployedAddr, ask } = require('./utils');

const main = async () => {
    const DeploymentManager = await hre.ethers.getContractFactory('DeploymentManager');
    const ERC20FundingContract = await hre.ethers.getContractFactory('ERC20FundingContract');
    const deploymentManager = await DeploymentManager.attach(getDeployedAddr(hre.network.name, 'DeploymentManager'));
    const biliraTokenAddr = '0x564A341Df6C126f90cf3ECB92120FD7190ACb401';

    let addrs = [
        "0x06C73d006cd4f7C97FD50e594506c1947C301262",
        "0x50a40D2Da2a4CA670Add4c0c9E2A38F117B3d0CF",
    ];

    console.log('Calculating the payments...');
    let [addresses, amounts] = await deploymentManager.functions.calculateShareAmounts(
        '9000000000', // 9000 TL
        addrs,
        biliraTokenAddr,
    );

    addresses = addresses.filter((addr) => addr !== '0x0000000000000000000000000000000000000000');
    amounts = amounts.map((amount) => amount.toString()).filter((amount) => amount !== '0');

    if (addresses.length === 0) {
        return console.log('Nothing to pay. Exiting.');
    }

    for (let i = 0; i < addresses.length; i++) {
        const campaign = await ERC20FundingContract.attach(addresses[i]);
        const total = parseFloat(await campaign.functions.totalBalance(addresses[i]));
        const amount = parseFloat(amounts[i]);
        console.log(`\t${addresses[i]} will get ${amount / 1000000}. New total amount will be ${(total + amount) / 1000000}`);
    }

    const response = await ask(`Are you sure you want to continue with the ${addresses.length} payments? (Y/N): \n`);
    if (response !== "Y") {
        return console.log('Cancelled');
    }
    console.log('We are ready to send the payments...');
    const tx = await deploymentManager.functions.makePayments(
        addresses,
        amounts,
        biliraTokenAddr,
    );
    const receipt = await tx.wait();

    console.log(receipt);
};

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
