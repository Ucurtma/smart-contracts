const hre = require('hardhat');
const { getDeployedAddr, ask } = require('./utils');

const main = async () => {
  const DeploymentManager = await hre.ethers.getContractFactory('DeploymentManager');
  const deploymentManager = await DeploymentManager.attach(getDeployedAddr(hre.network.name, 'DeploymentManager'));
  const biliraTokenAddr = '0x564A341Df6C126f90cf3ECB92120FD7190ACb401';

  console.log(deploymentManager.address);
  console.log('We are ready to send the payments...');
  const tx = await deploymentManager.functions.sendTokens(
    biliraTokenAddr,
    "0xaEf4bB2D11058a627468fDECC6D7E45CC75997c5");
  const receipt = await tx.wait();
  
  console.log(receipt);
  console.log('Done....');
};

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
