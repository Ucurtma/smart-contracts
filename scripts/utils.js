const path = require("path");
const fs = require('fs');

const deploymentsFilePath = path.resolve(__dirname, '../deployments.json');

const readDeploymentsFile = () => {
    return JSON.parse(fs.readFileSync(deploymentsFilePath, { encoding: 'utf8', flag: 'r' }));
}

module.exports.saveDeployedAddr = (network, contract, addr) => {
    const deployments = readDeploymentsFile();
    deployments[network][contract] = addr;
    fs.writeFileSync(deploymentsFilePath, JSON.stringify(deployments, null, 4));
}

module.exports.getDeployedAddr = (network, contract) => {
    const deployments = readDeploymentsFile();
    return deployments[network][contract];
}

module.exports.ask = async (question) => {
    const stdin = process.stdin, stdout = process.stdout;

    stdin.resume();
    stdout.write(question);

    return new Promise(res => {
        stdin.once('data', function (data) {
            res(data.toString().trim());
        });
    });
}