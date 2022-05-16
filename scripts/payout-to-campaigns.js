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
