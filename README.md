# Arc Pulse

A live vitals monitor for Arc Testnet - a real-time waveform of the gas price
(paid in USDC, Arc's native gas asset), block height and interval, and a live
feed of on-chain USDC transfers. No wallet connection required - it's entirely
read-only, polling the public RPC directly.

**Live demo:** https://arc-pulse-by-itolw.vercel.app/

## Why this exists

Arc's defining feature is that gas is paid in USDC instead of a separate
volatile token. This dashboard makes that visible and immediate - watching
the gas price move and USDC actually changing hands on-chain, without
needing to install a wallet or hold any funds.

## Features

- Live waveform of the gas price (gwei), polling every 6s
- Block height and time-since-last-block
- Rolling feed of USDC `Transfer` events decoded straight from chain logs,
  each linking out to ArcScan
- Fully read-only - no MetaMask, no signing, works for any visitor instantly

## Network

| Parameter | Value |
|---|---|
| Chain ID | `5042002` |
| RPC | `https://rpc.testnet.arc.network` |
| Explorer | `https://testnet.arcscan.app` |
| USDC contract | `0x3600000000000000000000000000000000000000` |

## Run locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. No wallet or testnet USDC needed.

## Build

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  arcConfig.js   # Arc Testnet RPC, USDC address, Transfer event topic
  usePulse.js    # polling hook: block height, gas price history, transfer feed
  App.jsx        # UI
  index.css      # styles
```

## Publish to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Arc Pulse network dashboard"
git branch -M main
git remote add origin https://github.com/itolw/arc-pulse.git
git push -u origin main
```

## Roadmap

This started as a companion to [arc-usdc-wallet](https://github.com/helleneburatino-web3/arc-usdc-wallet) —
next steps: highlight large ("whale") transfers distinctly, add a
mempool/pending-tx view, and surface basic TPS.
