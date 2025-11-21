export const NETWORK_LIST = [
  {
    env: 'mainnet',
    rpcUrl: 'https://fullnode.mainnet.sui.io:443',
    packageId: String(process.env.MAINNET_PACKAGE_ID) || null,
  },
  {
    env: 'testnet',
    rpcUrl: 'https://fullnode.testnet.sui.io:443',
    packageId: String(process.env.TESTNET_PACKAGE_ID) || null,
  },
  {
    env: 'devnet',
    rpcUrl: 'https://fullnode.devnet.sui.io:443',
    packageId: String(process.env.DEVNET_PACKAGE_ID) || null,
  },
]

export const NETWORK = NETWORK_LIST.find(network => network.env === process.env.NETWORK_ENV);

export const PACKAGE_ID = NETWORK?.packageId;