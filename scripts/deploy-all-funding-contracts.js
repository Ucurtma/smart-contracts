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
    const amountPerPayment = '1000000000';
    const biliraTokenAddr = '0x564A341Df6C126f90cf3ECB92120FD7190ACb401';
    const students = [
        // { addr: "0x9C156b78b2e3C1cc6a3ffCFadce8c3418a60F452", name: "Ömer Can Çali" }, //"0x955e5f56fae77db5829fae980adeac688fe80259"
        // { addr: "0x4afB1516E0243B0318f20B489f7465697b0fc9c3", name: "Eda Bekdaş" }, // "0x94861cEEFAAe0e7232E2274CE7B9199a8Afc055c"
        // { addr: "0xe99845aA4a8495416F10ec2728F707bC2F297686", name: "Elif Topaloğlu" }, // "0x33504d46CcEfC6D3f1f4ADc3D882fF3a5dbF93d4"
        // { addr: "0xaf5E876eE8a9E0BD276AbCCFe83F28546f01C93e", name: "Fuat Topcu" }, // "0x413FFA4c43ce4e617a77B394BB4f551Cd2530e1F"
        // { addr: "0xFf4E666C9Cb84fFC8348ff59B88530ef2331D17d", name: "Ahmet Ekmel Karaman " }, // "0xB6DB60D6Aa2fa3974A5702D026B9c097c9A56a12"
        // { addr: "0xBA728197d37dF7B0f5fCcF0E4A74d59cF5301550", name: "Sevda Güzel" }, // "0xd622860F488fD8A6F185a5B64dAEA3316e5717a9"
        // { addr: "0x6C50fFB6E48157DD6d04Bbebd1583cD5e8EF1fDa", name: "Merve Bilgi" }, // "0x82bc06cD64fFe21811004e5ce8a4Fe2b64E0B2C7"
        // { addr: "0x311c23F70FA7Ac8cBB49901FfE72e5655C0C1233", name: "emel ceren çelik" }, // "0x60587b4f8E95245064484cfd1f4f25b3963F1E4B"
        // { addr: "0x9e6CF75563434C519c84B2FfE7Fd24BB1c1e6DC6", name: "Salih Işik" }, // "0xCfC5b2301390AF6B45bAa9a4c7DD2D16A64e3260"
        // { addr: "0xE2Af6e6F6358Da40B934b3aAD136fdBFBE10A53a", name: "Bengisu Karabulut" }, // "0x2eed54f8d3F9C94e6f597a583c53a2B26217eA00"
        // { addr: "0x41af80969c24614F8Bd86C6ED0Fc90b333BbB6C8", name: "Tuğba Yildirim " }, // "0xB5B16eEa21b7aB403E156FA65EA8A076387Ef598"
        // { addr: "0x8057d17da37ec47a0fdcca76197fe3cddb177f51", name: "yasin çetin" }, // "0x2f556229461D7857940FB33046BEd989282BBB38"
        { addr: "0x15d321BeeD06D19B04cEDA453Ce1d1D4F18dE86c", name: "Hatice Yapalak" }, // "0x06C73d006cd4f7C97FD50e594506c1947C301262"
        { addr: "0xb8e96d41aD7dA3c56f4aDAb7A0B71858b07BD026", name: "Baris Yuzer" }, // "0x50a40D2Da2a4CA670Add4c0c9E2A38F117B3d0CF"
        // { addr: "0x55c23072e46b9d8b79C597513166b65B339fE21D", name: "Kaan Demirkoparan" },
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
            console.log(`TX for ${student.name} Tx: \n${tx.hash}`);
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

