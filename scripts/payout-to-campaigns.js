const hre = require('hardhat');

const main = async () => {
    const FundingContract = await hre.ethers.getContractFactory('ERC20FundingContract');
    const biliraTokenAddr = '0x564A341Df6C126f90cf3ECB92120FD7190ACb401';


    let addrs = [
        "0x221C8b76Ed69f95FdC37dd8D766d8D1936eF9401",
        "0x75Db9218F1a0BbE745AbfeEFa52a2aB179e70584",
        "0xD891906e4C36c6C5083581C351675d908ef52d35",
        "0x5108Dc4E37F11446c02224037619461fB1efF705",
        "0x0B1619261A97D313F97EA455eB795B596175039C",
        "0xD026Ad7f12E437f5aF4E45bAa74bcF078a08E074",
        "0x1A6Fa0514C9F9601Fd11C6D2d305124Bb3273D3F",
        "0xe59052d25ae0752D262DCb2B2da16799a5D3f40E",
        "0xc17d76c4702808FE23c987Fe5391A5ce298BFD15",
        "0x85A8aE672E110b7947FD173fce0b5C55f3e766F3",
        "0xf6FBaf4d8c34e609C10B54a7F6d7754e9EaFD54C",
        "0xa6A7365fC2635dC4091162B6c8248EBFA8a48e98",
        "0x505aa8CAB9D37205A5Aa6280fef1a4F0A95d44A6",
        "0xF4ea2aA0389B4248f3C3e56167B904c78e8C9d5e",
        "0x3f2D7430342b40810CF7a879c2A33270De7C057C",
        "0xA12490e8dadFbB3CE12F1744b2B34cA0f5Cd5Da9",
        "0xd7CdAca214C4ca42D22bD9cfD6eD3d33C5392EA5",
        "0x012fdE2c2f871F0F1D8d6aa82181228D3D18F1Fb",
        "0x42D4e0FD949EaFd5278269CDf642217387D3a19A",
        "0x4923e0998f917A34656114C93a90C9B74E813369",
        "0x09be5654C6E6d6B012D4F34e7cD8d821f89D58d3",
        "0x1Edc0c6d2Dc234332E568f58604C431B015feb98",
    ];

    for (let x = 0; x < addrs.length; x++) {
        console.log(`---------------------------`);
        let currentAddress = addrs[x];
        console.log(`Checking address: '${currentAddress}'`);
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
            const tx = await fundingContract.functions.withdraw();
            const receipt = await tx.wait();
            console.log(`${currentAddress}:`);
            if (receipt.transactionHash) {
                console.log(`\t Transaction hash: \t\t${receipt.transactionHash}`);
            }

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
