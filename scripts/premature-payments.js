const contracts = [
  // {
  //   cchain_address: '0x72F8cC25b050E23152390CdAEe36A8848bCD56b0',
  //   campaign_address: '0x743B89e6d23fD11a2b96fdb52C2a9b4dc2959071',
  // }
];

const hre = require('hardhat')
const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));

const main = async () => {
  const biliraTokenAddr = '0x564A341Df6C126f90cf3ECB92120FD7190ACb401'

  const FundingContract = await hre.ethers.getContractFactory(
    'AbstractFundingContract',
  )

  for ({ cchain_address, campaign_address, amount } of contracts) {
    console.log(`Withdraw triggering for '${campaign_address}' to '${cchain_address}'`);
    const campaign_contract = await FundingContract.attach(campaign_address);

    console.log(`\tCancellation '${campaign_address}'`);
    let tx = await campaign_contract.functions.toggleCancellation();
    await tx.wait();
    console.log(`\t\t... Done.`);

    console.log(`\tWithdraw triggered for '${campaign_address}' amount is ${amount}`);
    tx = await campaign_contract.functions.paybackTokens(
      cchain_address,
      amount,
    )
    await tx.wait();
    console.log(`\t\t... Done.`);

    console.log(`\tResuming contract'${campaign_address}'`);
    tx = await campaign_contract.functions.toggleCancellation();
    await tx.wait();
    console.log(`\t\t... Done.`);

    console.log(`Zzzzz...`);
    await snooze(2000);
    console.log(``);

  }
  console.log(`--------------------------- \n`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
