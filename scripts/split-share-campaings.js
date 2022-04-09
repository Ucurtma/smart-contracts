const hre = require('hardhat');
const { getDeployedAddr, ask } = require('./utils');

const main = async () => {
    const DeploymentManager = await hre.ethers.getContractFactory('DeploymentManager');
    const ERC20FundingContract = await hre.ethers.getContractFactory('ERC20FundingContract');
    const deploymentManager = await DeploymentManager.attach(getDeployedAddr(hre.network.name, 'DeploymentManager'));
    const biliraTokenAddr = '0x564A341Df6C126f90cf3ECB92120FD7190ACb401';

    let addrs = [
        "0x955E5F56fae77Db5829FAE980ADeAc688fE80259",
        "0x94861cEEFAAe0e7232E2274CE7B9199a8Afc055c",
        "0x33504d46CcEfC6D3f1f4ADc3D882fF3a5dbF93d4",
        "0x413FFA4c43ce4e617a77B394BB4f551Cd2530e1F",
        "0xB6DB60D6Aa2fa3974A5702D026B9c097c9A56a12",
        "0xd622860F488fD8A6F185a5B64dAEA3316e5717a9",
        "0x82bc06cD64fFe21811004e5ce8a4Fe2b64E0B2C7",
        "0x60587b4f8E95245064484cfd1f4f25b3963F1E4B",
        "0xCfC5b2301390AF6B45bAa9a4c7DD2D16A64e3260",
        "0x2eed54f8d3F9C94e6f597a583c53a2B26217eA00",
        "0xB5B16eEa21b7aB403E156FA65EA8A076387Ef598",
        "0x2f556229461D7857940FB33046BEd989282BBB38",
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
