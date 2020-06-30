module.exports = {
  networks: {
    development: {
      protocol: 'http',
      host: 'localhost',
      port: 8546,
      gas: 5000000,
      gasPrice: 5e9,
      networkId: '*',
    },
  },
};
