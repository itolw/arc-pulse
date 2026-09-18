// Arc Testnet — read-only config. This dashboard never asks for a wallet;
// it just polls the public RPC for chain vitals and USDC transfer activity.

export const ARC_TESTNET = {
  chainId: 5042002,
  rpcUrl: 'https://rpc.testnet.arc.network',
  explorerUrl: 'https://testnet.arcscan.app',
}

// USDC is the native gas asset on Arc; this is its standard ERC-20 interface,
// used here only to decode Transfer events for the activity feed.
export const USDC_ADDRESS = '0x3600000000000000000000000000000000000000'
export const USDC_DECIMALS = 6

// keccak256("Transfer(address,address,uint256)")
export const TRANSFER_TOPIC =
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

export const POLL_INTERVAL_MS = 6000
