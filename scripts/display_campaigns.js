const moment = require('moment');
const axios = require('axios').default;
const Web3 = require('web3');
const Erc20FundingContract = require('../build/contracts/ERC20FundingContract.json');
const web3 = new Web3(`https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`);
const BILIRA_DECIMALS = 6;

const start = async () => {
    const query = `
        query {
          campaigns(start: 0, end: 100, campaignType: LongTerm) {
            campaigns {
              campaignId
              student {
                name
              }
              ethereumAddress
              isActive
            }
        }
        }
    `;

    const response = await axios.post('https://api.ucurtmaprojesi.com/graphql', {
        query: query
    });

    const campaigns = response.data.data.campaigns.campaigns;
    const biLiraAddr = '0x2c537e5624e4af88a7ae4060c022609376c8d0eb';

    for (campaign of campaigns) {
        const response = await axios.get(`https://api.etherscan.io/api?module=account&action=tokentx&address=${campaign.ethereumAddress}&page=1&offset=0&sort=desc&apikey=${process.env.ETHERSCAN_API_KEY}`, {
            query: query
        });
        const mostRecentIncomingTransaction = response.data.result.find((transaction) => transaction.to === campaign.ethereumAddress);
        const campaignContract = new web3.eth.Contract(Erc20FundingContract.abi, campaign.ethereumAddress);
        const totalBalanceInDecimals = await campaignContract.methods.totalBalance(biLiraAddr).call();

        console.log(`
            ============
            Ögrenci: ${campaign.student.name}
            Contract: ${campaign.ethereumAddress}
            Bakiye: ${normalizeAmount(totalBalanceInDecimals, BILIRA_DECIMALS)} BiLira
            Son Destek Tarihi: ${moment(mostRecentIncomingTransaction.timeStamp * 1000).format('DD-MM-YYYY')}
            Son Destek Miktarı: ${normalizeAmount(mostRecentIncomingTransaction.value, BILIRA_DECIMALS)} ${mostRecentIncomingTransaction.tokenName}
        `);
    }
}

const normalizeAmount = (amount, decimals) => {
    return parseInt(amount) / Math.pow(10, decimals);
}

start();
