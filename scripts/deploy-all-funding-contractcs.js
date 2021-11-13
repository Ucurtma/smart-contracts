const hre = require('hardhat');
const web3 = require('web3');
const moment = require('moment');
const { getDeployedAddr } = require('./utils');


const toEpoch = input => {
    return moment(input).unix();
};

const toTimestamp = inputDays => {
    return parseInt(inputDays) * (24 * 60 * 60);
};

const main = async () => {
    const DeploymentManager = await hre.ethers.getContractFactory('DeploymentManager');
    const deploymentManager = await DeploymentManager.attach(getDeployedAddr(hre.network.name, 'DeploymentManager'));
    const amountPerPayment = '500000000';
    const biliraTokenAddr = '0x564A341Df6C126f90cf3ECB92120FD7190ACb401';
    const students = [
        // { name: "Billur", addr: "Pekbaş	" },
        { name: "Kaan Demirkoparan", addr: "0x55c23072e46b9d8b79C597513166b65B339fE21D" },
        { name: "Nil Gülmez", addr: "0x49fcC7f56140Ce2595393aE42238504ab66A49eb" },
        { name: "Rabia Alay", addr: "0x0E8cD84972b09d26B824F11784ec07adf17f85E8" },
        { name: "Birgül Sümer", addr: "0x72F8cC25b050E23152390CdAEe36A8848bCD56b0" },
        { name: "Ece Harbelioğlu", addr: "0x33d12CbF3dca9e261B9a501652bdDB6015AC8e30" },
        { name: "Rıdvan köysu", addr: "0x6b9cEcF7794657163Da56579aD2ff35B05793304" },
        { name: "Hüseyin Oyman", addr: "0x95A38c0f8FE42Dd1fD4d0e198070bf72611F94c6" },
        { name: "Mustafa Günkan", addr: "0xaCbA64BBe9b8A0718e38815837abC6d40eac3CaB" },
        { name: "İpek akdemir", addr: "0x44712359c9F92F9A95C47367121C82dDdCd2A54D" },
        { name: "Halime BABÜR", addr: "0x198F4Eb33a856C2C3e26a0455266171a1A2A1724" },
        { name: "Tuğba Yıldırım", addr: "0x41af80969c24614F8Bd86C6ED0Fc90b333BbB6C8" },
        { name: "Mehmet Ali Aydın", addr: "0xf1947e4bDa190D41d25069B123EE56366040fc0f" },
        { name: "Şeyda Tarım", addr: "0x58DC5f41E9176790C9b48A8A353Ec11bA45b274f" },
        { name: "Hayrullah Can Özkan", addr: "0x08621e25a19E48E91df418428Bf6CECD6A707f09" },
        { name: "EMİNE NUR ATAKOL", addr: "0x21790F1b4dF19185a8d43476089eA27117B48923" },
        { name: "Murat ayten", addr: "0xA427ce735245e779E2E314b14BD3D7800D9a01E0" },
        { name: "Muhammet Rezan İçgil", addr: "0xb438Fee65524C7c5cd3B86CcC10cbD6E8e4049c0" },
        { name: "Eren Yılmaz", addr: "0x65825cDA0FE9c00b0b5A5C0c04f875c5518AAA57" },
        { name: "Barış Timur", addr: "0x54811F2B9B89CeE4eB1632e88B359E0CA26F443F" },
        { name: "Recep Aksona", addr: "0x1B70Afd01deA9446A4Fb5B19624C41A1D06Cca9b" },
        { name: "yasemin akşeker", addr: "0x7CA1A826eB94CeD6DB04e37b6150f63F5Aa8e3e2" },
        { name: "Ezgi Altun", addr: "0xCd1A82dC4B83D252d009313dC86baac3ea3E68f6" },
        { name: "Zeynep Aksu", addr: "0x2e0Cb9d9CD9976Bc60548dCD70574fEF714681AE" },
        { name: "Rozelin Aslan", addr: "0x8C2b7DAFEd1b20f7aD0A7F0a679521438da8C724" },
    ];

    for (student of students) {
        try {
            const tx = await deploymentManager.functions.deploy(
                9,
                toTimestamp(28),
                toEpoch(moment().add(0, 'day')),
                amountPerPayment,
                student.addr,
                biliraTokenAddr,
            );
            const receipt = await tx.wait();

            console.log(`${student.name}'s contract deployed to ${receipt.events[0].args.deployedAddress}`);
        } catch (err) {
            console.log(`Could not deploy ${student.name}'s contract. Stack: ${err.stack}`);
        }
    }
};

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

