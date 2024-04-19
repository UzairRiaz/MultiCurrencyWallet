/*
window.widgetERC20Comisions = {
  matic: {
    fee: '5',
    address: '',
    min: '0,001',
  }
}

window.widgetEvmLikeTokens = [
  {
    standard: '',
    address: '',
    decimals: ,
    name: '',
    fullName: '',
    icon: '',
    customExchangeRate: '',
    iconBgColor: '',
    howToDeposit: '',
    howToWithdraw: '',
  }
]

window.buildOptions = {
  ownTokens: false, // Will be inited from window.widgetEvmLikeTokens
  addCustomTokens: true, // Allow user add custom evm like tokens
  curEnabled: { // Or 'false' if enabled all
    btc: true,
    eth: true,
  },
  blockchainSwapEnabled: { // Or 'false' if enabled all
    btc: true,
    eth: true,
  },
  defaultExchangePair: {
    buy: 'eth',
    sell: 'btc',
  }
  invoiceEnabled: false, // Allow create invoices
}
*/

window.widgetEvmLikeTokens = [
  {
    standard: 'erc20matic', // BLOCKCHAIN: 'matic'
    address: '0x42aF7aAc6AE6425Ffa96370cFD0B12522Aa4b458',
    decimals: 18,
    name: 'KAXAA',
    fullName: 'KAXAA Token',
    symbol: 'KAX',
  },
  {
    standard: 'erc20matic', //
    address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
    decimals: 6,
    name: 'USDC',
    fullName: 'USD Coin',
    symbol: 'USDC',
  },
  {
    standard: 'erc20matic', //
    address: '0x0000000000000000000000000000000000001010',
    decimals: 18,
    name: 'MATIC',
    fullName: 'MATIC Token',
    symbol: 'MATIC',
  },
  {
    standard: 'erc20', //
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 18,
    name: 'USDT',
    fullName: 'USDT Token',
    symbol: 'USDT',
  }
]

window.buildOptions = {
  showWalletBanners: true, // Allow to see banners
}
