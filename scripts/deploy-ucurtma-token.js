/**
 * Example usage
 * npx hardhat run --network fuji scripts/deploy-ucurtma-token.js
 */

 const hre = require("hardhat");
 const { saveDeployedAddr } = require('./utils');

 const main = async () => {
     const UcurtmaTestToken = await hre.ethers.getContractFactory("UcurtmaTestToken");
     const ucurtmaTestToken = await UcurtmaTestToken.deploy();
     await ucurtmaTestToken.deployed();
 
     console.log("Ucurtma Token deployed to:", ucurtmaTestToken.address);
     saveDeployedAddr(hre.network.name, 'UcurtmaTestToken', ucurtmaTestToken.address);
 };
 
 main()
     .then(() => process.exit(0))
     .catch(error => {
         console.error(error);
         process.exit(1);
     });
 