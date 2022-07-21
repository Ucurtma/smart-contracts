const hre = require('hardhat');

const main = async () => {
    const FundingContract = await hre.ethers.getContractFactory('ERC20FundingContract');
    const biliraTokenAddr = '0x564A341Df6C126f90cf3ECB92120FD7190ACb401';


    let addrs = [
        // suspend the below contract, we'll change the address soon.
        // "0xaD8e4Bfa1817C6D772AEba769D671Af3d445E0d0",
        // "0x5215a9DE0657ce2f7FfF20B36e481C4EA7c17792",

        // reset back asap
        // "0x743B89e6d23fD11a2b96fdb52C2a9b4dc2959071",
        "0x67A413b7EA4Fd3FB14901624fcD19C70E6ed39c7",
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
        "0x06C73d006cd4f7C97FD50e594506c1947C301262",
        "0x50a40D2Da2a4CA670Add4c0c9E2A38F117B3d0CF",
    ];

    for (let x = 0; x < addrs.length; x++) {
        console.log(`---------------------------`);
        let currentAddress = addrs[x];
        console.log(`Checking address: '${currentAddress}'`);

        try {
            let fundingContract = await FundingContract.attach(currentAddress);
            const [canWithdraw] = await fundingContract.functions.canWithdraw();
            const [totalBalance] = await fundingContract.functions.totalBalance(biliraTokenAddr);
            const [totalLeft] = await fundingContract.functions.totalNumberOfPayoutsLeft();
            const [lastWithdraw] = await fundingContract.functions.lastWithdraw();
            const [withdrawPeriod] = await fundingContract.functions.withdrawPeriod();
            const epochTimeToWithdraw = parseInt(lastWithdraw) + parseInt(withdrawPeriod);
            const whenToWithdraw = (epochTimeToWithdraw - Math.floor(Date.now() / 1000)) / 60 / 60;
            const hoursToWithdraw = Math.floor(whenToWithdraw);
            const minutesToWithdraw = Math.floor((whenToWithdraw - hoursToWithdraw) * 60);
            console.log(`Total Balance: \t\t${parseInt(totalBalance.toString()) / 10 ** 6} TRYb`);
            console.log(`Can withdraw: \t\t${canWithdraw.toString()}`);
            console.log(`Total Left: \t\t${totalLeft.toString()}`);
            console.log(`When to run: \t\t${hoursToWithdraw} hours and ${minutesToWithdraw} minutes later.`);

            if (canWithdraw && parseInt(totalBalance.toString()) > 0) {
                console.log(`Withdraw triggering for '${currentAddress}'`);
                const tx = await fundingContract.functions.withdraw({ gasLimit: 100000 });
                console.log(tx);
                const receipt = await tx.wait();
                console.log(`${currentAddress}:`);
                if (receipt.transactionHash) {
                    console.log(`\t Transaction hash: \t\t${receipt.transactionHash}`);
                }

            }
        } catch (e) {
            console.log(`\t Address failed. Adding the address to retry list`);
            addrs.push(currentAddress);
        }
        console.log(`--------------------------- \n`);
    }
};

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
