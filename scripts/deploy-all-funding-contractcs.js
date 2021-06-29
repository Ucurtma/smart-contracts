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
        { name: "Gülnisa İnankul", addr: "0xcCBC00C231422Cb016cdd90F83896a859dC0BE87" },
        { name: "Kaan ülker", addr: "0xD951159E8E0e1e3FA526377cE1d85D1A88342440" },
        { name: "Ömer Can Çalı", addr: "0x9C156b78b2e3C1cc6a3ffCFadce8c3418a60F452" },
        { name: "Özgün Demiral", addr: "0xA1090a629536E3D131C71BF603A3265Ad1db5a3D" },
        { name: "Melih Serin", addr: "0x5fb52c545068B1A31c98b6DF24385bA01E5561f2" },
        { name: "Busenur Eren", addr: "0x1a9c5773894EadCbf796f1c34f97e789C1dE7913" },
        { name: "Hicran Bodrumlu", addr: "0x7f5f842696Fb816ddC4524480bB0633D73dB3c69" },
        { name: "Yusuf Alptekin Çam", addr: "0x25e307519562d0d5C76550b62b3c81BFD6057782" },
        { name: "Tuğba Zeki", addr: "0x60C0ae3C63f2955075DB736d73a5f7Ca4645DE44" },
        { name: "Rabia Duygu İoana Kayaner", addr: "0xd88F3770582c9b3d7AaC788041F52A5D590A26aB" },
        { name: "Büşra Demir", addr: "0x07180D67AaaCFb7821adf34C0eafF813E826ED1f" },
        { name: "Orkun Mahir Kılıç", addr: "0x4329AbeD9a8b987A2C0910C7fF439C4504d59f58" },
        { name: "Ali Bozyılan", addr: "0x0BECB9534e70C14b00E6dfC44929D68808d0Bb94" },
        { name: "Müge Keçeci", addr: "0x5238c8A74d511DEC7dE4fC12e8b2BE15bEe07b6F" },
        { name: "Doğukan Kurşat", addr: "0x5F69E2c5f6485E9002C364CDff9B13890e590967" },
        { name: "Bahri Atakan Yıldız", addr: "0xc7EF86D8f814846Aa58D31eCE7Cb668B958B8c4B" },
        { name: "Merve Gündoğmuş", addr: "0x2dA1C52897c046FA26Ab4d0eB909f385eC5596C9" },
        { name: "Dilan Can karakulak", addr: "0x19c39616f5dA156bb2A93bF5BdF0e311621052c4" },
        { name: "hüsnü beha yıldız", addr: "0x255dC1f80284589BA9D631949632Dc6177313fcd" },
        { name: "şeyma altundal", addr: "0x5f0E7db6EFD454d3FB4Bde01B1D1e098786F74E2" },
        { name: "Anıl Tülü", addr: "0x1956367fA438b6c687d5Ab923DAa3d91648C6C61" },
        { name: "Mustafa Eren Halil", addr: "0x995fA596569342FF17eE2AcFf1a5267499e379a7" },
    ];

    for (student of students) {
        try {
            const tx = await deploymentManager.functions.deploy(
                2,
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

