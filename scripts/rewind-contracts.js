const hre = require('hardhat');
const web3 = require('web3');
const moment = require('moment');
const { getDeployedAddr } = require('./utils');

/**
 * Collect all the money from all the contracts below.
 *  This is a process to prevent wrongly created contract and rollback if you accidentally deployed contracts with wrong parameters.
 */

const old_contracts = [
    "0x7FACcf36473d59bA8De6a0f8B249177195A03B92",
    "0xC9aFBe0159992721D3DaDef3A973755b69FD4c53",
    "0x655b48D9104F03226A8348EC960BfaDDa080099D",
    "0xA9EfD74Abd77936afd493CA4F532284B1d8FeABD",
    "0x472656978FfE659daBCEe335f4fc78becF81A655",
    "0xB7658dC0f7241CA4eb3E4730FC52176c8050F2F5",
    "0x01DbA04aB1a9cb7F93329c1A600772eD2C947014",
    "0xB4F80184F22BB8380F3fe3426cf5Bc3D7A45dCF5",
    "0x9fAd0Bd786FF846B8EAC661A662CB2afecC4a8d1",
    "0xf5742dAf18A1c92B031CDB40b756901fB2e2A5B3",
    "0x7c0A5B8F53674ceFFF260cb5d7EE6bc7759ecB92",
    "0x98E0A36d3B26ccBBeeDAbc5D9cD14e740bE39Fe4",
    "0xA90398bcC6cC60bf64Ad377392a2Ec10eDcfce0c",
    "0xEc5Ad43DF3087BCe02F3c50e16c45BF8c908e822",
    "0xA185D94f9925e15195c26AD279FCfBcaC8f657eA",
    "0x82A49049a1f19310d70259D6c3aFCCd31128e589",
    "0x90D0Bc97Dc3B30b00342517D95ba3D92852e3b6E",
    "0xf5515977C4b325640Da1fbDb7518c0c9bFA263E5",
    "0xe162c931C0a1C5F620Daa763cb345E777eC0504B",
    "0xF2aC1a5A966621d2a576c852d22d737a47cb6C0E",
    "0x426047DF0864bCB5edF83DaF2A09EBd8d6B8AeE9",
    "0x4556c731AEb96b4B1D8E77fd43a9486Aa70D1846",
    "0x2607BF62d5BD5Ff2C798D52ED60fc5399fC2Df0B",
];

const campaign_ids = [
    "nil-gulmez",
    "rabia-alay",
    "birgul-sumer",
    "ece-harbelioglu",
    "ridvan-koysu",
    "huseyin-oyman",
    "mustafa-gunkan",
    "ipek-akdemir",
    "halime-babur",
    "tugba-yildirim",
    "mehmet-ali-aydin",
    "seyda-tarim",
    "hayrullah-can-ozkan",
    "emine-nur-atakol",
    "murat-ayten",
    "rezan-icgil",
    "eren-yilmaz",
    "baris-timur",
    "recep-aksona",
    "yasemin-akseker",
    "ezgi-altun",
    "zeynep-aksu",
    "rozelin-arslan",
];

const main = async () => {
    const biliraTokenAddr = '0x564A341Df6C126f90cf3ECB92120FD7190ACb401';

    const FundingContract = await hre.ethers.getContractFactory('AbstractFundingContract');

    for (old_contract of old_contracts) {
        console.log(`Withdraw triggering for '${old_contract}'`);
        const campaign_contract = await FundingContract.attach(old_contract);
        const tx = await campaign_contract.functions.sendTokens(biliraTokenAddr, "0x955E5F56fae77Db5829FAE980ADeAc688fE80259");
        const receipt = await tx.wait();
        console.log(`${old_contract}:`);
        if (receipt.transactionHash) {
            console.log(`\t Transaction hash: \t\t${receipt.transactionHash}`);
        }
    }
    console.log(`--------------------------- \n`);

};


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });