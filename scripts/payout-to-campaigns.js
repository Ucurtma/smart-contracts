const hre = require('hardhat');

const main = async () => {
    const FundingContract = await hre.ethers.getContractFactory('ERC20FundingContract');
    const biliraTokenAddr = '0x564A341Df6C126f90cf3ECB92120FD7190ACb401';


    let addrs = [
        "0x6BD4D82BfCAee5319f438efb383c01B55E0aA558",
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
