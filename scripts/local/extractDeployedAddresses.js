#!/usr/bin/env node

/* This script extracts deployed addresses from build folder and puts them into deployedAddresses_{network-name}.json */

const fs = require("fs");
const path = require("path");
const yargs = require("yargs");

// --network avax|eth
const network = yargs.argv.network;
if (!network) {
  network = "eth";
}

const projectDir = path.join(__dirname, "..", "..");
const deployerJsonPath = path.join(
  projectDir,
  "build",
  "contracts",
  "DeploymentManager.json"
);
const deployedAddressesJsonPath = path.join(
  projectDir,
  `deployedAddresses_${network}.json`
);

const { networks } = require(deployerJsonPath);

const deployedAddresses = networks;

Object.keys(deployedAddresses).forEach((key) => {
  switch (key) {
    case "1": // mainnet
    case "3": // ropsten
    case "4": // rinkeby
    case "42": // kovan
      break;
    default:
      delete deployedAddresses[key];
  }
});

fs.writeFileSync(
  deployedAddressesJsonPath,
  JSON.stringify(deployedAddresses, null, 2)
);
