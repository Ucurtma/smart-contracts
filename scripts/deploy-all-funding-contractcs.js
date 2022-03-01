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
        { name: "Ahmet", addr: "0xf6D0dDe6df9D69d0D79d5976298949D3b1cD2336" },
    ];

    for (student of students) {
        try {
            const tx = await deploymentManager.functions.deploy(
                1,
                toTimestamp(0),
                toEpoch(moment().add(33, 'day')),
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

