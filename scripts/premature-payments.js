const contracts = [
  // {
  //   cchain_address: '0x72F8cC25b050E23152390CdAEe36A8848bCD56b0',
  //   campaign_address: '0x743B89e6d23fD11a2b96fdb52C2a9b4dc2959071',
  // }
  // ,
  // {
  //   cchain_address: '0x55c23072e46b9d8b79C597513166b65B339fE21D',
  //   campaign_address: '0x02F12A1b912Edf1f2E83eBC2133081B08eea318C',
  // },
  // {
  //   cchain_address: '0x49fcC7f56140Ce2595393aE42238504ab66A49eb',
  //   campaign_address: '0x8d84508cb9d805a0c1805B76CAfD9B69645a0E4C',
  // },
  // ,
  // {
  //   cchain_address: '0x0E8cD84972b09d26B824F11784ec07adf17f85E8',
  //   campaign_address: '0xFf29ff0b66854AC45ca31188b87bA878E191FD92',
  //   amount: 500000000,
  // },
  // {
  //   cchain_address: '0x72F8cC25b050E23152390CdAEe36A8848bCD56b0',
  //   campaign_address: '0x0b89baA70A32377E37446a0DF0A8978EB8C55363',
  // },

  // {
  //   cchain_address: '0x95A38c0f8FE42Dd1fD4d0e198070bf72611F94c6',
  //   campaign_address: '0xC4D9bDf25758Ee8372D5207c808B00D971e945b7',
  // },
  // {
  //   cchain_address: '0xaCbA64BBe9b8A0718e38815837abC6d40eac3CaB',
  //   campaign_address: '0xA60A9159CA475171f4c7286827E530BedEE7CaC2',
  // },
  // {
  //   cchain_address: '0x44712359c9F92F9A95C47367121C82dDdCd2A54D',
  //   campaign_address: '0xf909f13931210Dd06D006ba9C3b5fB3cB51995e3',
  // },
  // {
  //   cchain_address: '0x198F4Eb33a856C2C3e26a0455266171a1A2A1724',
  //   campaign_address: '0xeB33ea0D24CE3944b3D80a35eff9253BFDd52425',
  // },
  // {
  //   cchain_address: '0x41af80969c24614F8Bd86C6ED0Fc90b333BbB6C8',
  //   campaign_address: '0xEbEca5C2AfAF5E6B7031b19DF235e4137564D120',
  // },
  // {
  //   cchain_address: '0xf1947e4bDa190D41d25069B123EE56366040fc0f',
  //   campaign_address: '0xdf85739293c8b1482b300C4685F8e94697682882',
  // },
  // {
  //   cchain_address: '0x58DC5f41E9176790C9b48A8A353Ec11bA45b274f',
  //   campaign_address: '0xeF9d2BdCFcD4BDbC64eaBBFF227C8665379AD26B',
  // },
  // {
  //   cchain_address: '0x08621e25a19E48E91df418428Bf6CECD6A707f09',
  //   campaign_address: '0x527a8A190900ab4CEF3d3bb2842dFc523eB3169F',
  // },
  // {
  //   cchain_address: '0xA427ce735245e779E2E314b14BD3D7800D9a01E0',
  //   campaign_address: '0x5BFC85423DB8f3F2BC7FFd2626361e3ff8e1c123',
  // },
  // {
  //   cchain_address: '0xb438Fee65524C7c5cd3B86CcC10cbD6E8e4049c0',
  //   campaign_address: '0x8964B368110C2EF7E7F6Dd43Cb750227Fb2c19B3',
  // },
  // {
  //   cchain_address: '0x65825cDA0FE9c00b0b5A5C0c04f875c5518AAA57',
  //   campaign_address: '0x5DC18EAe46280C48623550879cE855E3065ADE55',
  // },
  // {
  //   cchain_address: '0x54811F2B9B89CeE4eB1632e88B359E0CA26F443F',
  //   campaign_address: '0x431393476ebEdFBaE00512AD5482d6054E566f45',
  // },
  // {
  //   cchain_address: '0x1B70Afd01deA9446A4Fb5B19624C41A1D06Cca9b',
  //   campaign_address: '0xCdCd8E8f77Bf9cd72F5c5599272743DC84Fd9511',
  // },
  // {
  //   cchain_address: '0x7CA1A826eB94CeD6DB04e37b6150f63F5Aa8e3e2',
  //   campaign_address: '0x9026eBf16E948C7d58C9A999fe213304919e8EE0',
  // },
  // {
  //   cchain_address: '0xCd1A82dC4B83D252d009313dC86baac3ea3E68f6',
  //   campaign_address: '0x49001C88191769bA7Caf0473Cd6A778f2534a0C5',
  // },
  // {
  //   cchain_address: '0x2e0Cb9d9CD9976Bc60548dCD70574fEF714681AE',
  //   campaign_address: '0x5E922A6Ab4dD04d1f9ca7eF9Af69F4938356F252',
  // },
  // // Ridvan
  // {
  //   cchain_address: '0x6b9cEcF7794657163Da56579aD2ff35B05793304',
  //   campaign_address: '0x8D5C66FBDD689ddB3D7F705385C908ab6d358361',
  //   amount: 500000000,
  // },
  // //emine nur
  // {
  //   cchain_address: '0x21790F1b4dF19185a8d43476089eA27117B48923',
  //   campaign_address: '0xe71CFf263E71FFB30D0014d99965e2672AcB1E22',
  //   amount: 333000000,
  // },
  // //ece
  // {
  //   cchain_address: '0x33d12CbF3dca9e261B9a501652bdDB6015AC8e30',
  //   campaign_address: '0x0fFD3357f70f2814b1D16ee7469685f3DbFCDF95',
  //   amount: 500000000,
  // },
  // //rozelin
  // {
  //   cchain_address: '0x8C2b7DAFEd1b20f7aD0A7F0a679521438da8C724',
  //   campaign_address: '0x413290e262Fc1227A822d352ee5dE64C81DDBDeC',
  //   amount: 500000000,
  // },
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
