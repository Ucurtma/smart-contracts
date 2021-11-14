const hre = require('hardhat');
const { getDeployedAddr, ask } = require('./utils');

const main = async () => {
    const DeploymentManager = await hre.ethers.getContractFactory('DeploymentManager');
    const ERC20FundingContract = await hre.ethers.getContractFactory('ERC20FundingContract');
    const deploymentManager = await DeploymentManager.attach(getDeployedAddr(hre.network.name, 'DeploymentManager'));
    const biliraTokenAddr = '0x564A341Df6C126f90cf3ECB92120FD7190ACb401';

    let addrs = [
        "0x743B89e6d23fD11a2b96fdb52C2a9b4dc2959071",
        "0x02F12A1b912Edf1f2E83eBC2133081B08eea318C",
        "0x8d84508cb9d805a0c1805B76CAfD9B69645a0E4C",
        "0xFf29ff0b66854AC45ca31188b87bA878E191FD92",
        "0x0b89baA70A32377E37446a0DF0A8978EB8C55363",
        "0x0fFD3357f70f2814b1D16ee7469685f3DbFCDF95",
        "0x8D5C66FBDD689ddB3D7F705385C908ab6d358361",
        "0xC4D9bDf25758Ee8372D5207c808B00D971e945b7",
        "0xA60A9159CA475171f4c7286827E530BedEE7CaC2",
        "0xf909f13931210Dd06D006ba9C3b5fB3cB51995e3",
        "0xeB33ea0D24CE3944b3D80a35eff9253BFDd52425",
        "0xEbEca5C2AfAF5E6B7031b19DF235e4137564D120",
        "0xdf85739293c8b1482b300C4685F8e94697682882",
        "0xeF9d2BdCFcD4BDbC64eaBBFF227C8665379AD26B",
        "0x527a8A190900ab4CEF3d3bb2842dFc523eB3169F",
        "0xe71CFf263E71FFB30D0014d99965e2672AcB1E22",
        "0x5BFC85423DB8f3F2BC7FFd2626361e3ff8e1c123",
        "0x8964B368110C2EF7E7F6Dd43Cb750227Fb2c19B3",
        "0x5DC18EAe46280C48623550879cE855E3065ADE55",
        "0x431393476ebEdFBaE00512AD5482d6054E566f45",
        "0xCdCd8E8f77Bf9cd72F5c5599272743DC84Fd9511",
        "0x9026eBf16E948C7d58C9A999fe213304919e8EE0",
        "0x49001C88191769bA7Caf0473Cd6A778f2534a0C5",
        "0x5E922A6Ab4dD04d1f9ca7eF9Af69F4938356F252",
        "0x413290e262Fc1227A822d352ee5dE64C81DDBDeC",
    ];

    console.log('Calculating the payments...');
    let [addresses, amounts] = await deploymentManager.functions.calculateShareAmounts(
        '4500000000', // 4500 TL
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
