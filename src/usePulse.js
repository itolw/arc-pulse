import { useEffect, useRef, useState } from 'react'
import { JsonRpcProvider, formatUnits, Interface } from 'ethers'
import {
  ARC_TESTNET,
  USDC_ADDRESS,
  USDC_DECIMALS,
  TRANSFER_TOPIC,
  POLL_INTERVAL_MS,
} from './arcConfig'

const iface = new Interface([
  'event Transfer(address indexed from, address indexed to, uint256 value)',
])

const HISTORY_LENGTH = 40

function short(addr) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

// Polls Arc Testnet directly — no wallet connection, just public reads.
export function usePulse() {
  const [status, setStatus] = useState('connecting') // connecting | live | error
  const [blockNumber, setBlockNumber] = useState(null)
  const [blockTime, setBlockTime] = useState(null) // seconds since last block change
  const [gasGwei, setGasGwei] = useState(null)
  const [gasHistory, setGasHistory] = useState([])
  const [transfers, setTransfers] = useState([])
  const [error, setError] = useState(null)

  const providerRef = useRef(null)
  const lastBlockRef = useRef(null)
  const lastBlockAtRef = useRef(null)
  const scannedUpToRef = useRef(null)

  useEffect(() => {
    const provider = new JsonRpcProvider(ARC_TESTNET.rpcUrl, undefined, {
      staticNetwork: true,
    })
    providerRef.current = provider
    let cancelled = false
    let tickTimer = null

    async function poll() {
      try {
        const [bn, feeData] = await Promise.all([
          provider.getBlockNumber(),
          provider.getFeeData(),
        ])
        if (cancelled) return

        if (bn !== lastBlockRef.current) {
          if (lastBlockRef.current !== null && lastBlockAtRef.current) {
            setBlockTime(((Date.now() - lastBlockAtRef.current) / 1000).toFixed(1))
          }
          lastBlockRef.current = bn
          lastBlockAtRef.current = Date.now()
        }
        setBlockNumber(bn)

        const gwei = feeData.gasPrice ? Number(formatUnits(feeData.gasPrice, 'gwei')) : null
        if (gwei !== null) {
          setGasGwei(gwei)
          setGasHistory((prev) => {
            const next = [...prev, gwei]
            return next.length > HISTORY_LENGTH ? next.slice(-HISTORY_LENGTH) : next
          })
        }

        // Scan a small window of recent blocks for USDC transfers.
        const fromBlock =
          scannedUpToRef.current !== null ? scannedUpToRef.current + 1 : Math.max(bn - 5, 0)
        if (fromBlock <= bn) {
          const logs = await provider.getLogs({
            address: USDC_ADDRESS,
            topics: [TRANSFER_TOPIC],
            fromBlock,
            toBlock: bn,
          })
          scannedUpToRef.current = bn

          if (logs.length) {
            const decoded = logs
              .map((log) => {
                try {
                  const parsed = iface.parseLog(log)
                  return {
                    id: `${log.transactionHash}-${log.logIndex}`,
                    from: short(parsed.args.from),
                    to: short(parsed.args.to),
                    amount: Number(formatUnits(parsed.args.value, USDC_DECIMALS)),
                    hash: log.transactionHash,
                    blockNumber: log.blockNumber,
                  }
                } catch {
                  return null
                }
              })
              .filter(Boolean)
              .reverse()

            if (decoded.length) {
              setTransfers((prev) => [...decoded, ...prev].slice(0, 30))
            }
          }
        } else {
          scannedUpToRef.current = bn
        }

        setStatus('live')
        setError(null)
      } catch (err) {
        if (!cancelled) {
          setStatus('error')
          setError(err?.message || 'Failed to reach Arc RPC.')
        }
      }
    }

    poll()
    tickTimer = setInterval(poll, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(tickTimer)
    }
  }, [])

  return { status, blockNumber, blockTime, gasGwei, gasHistory, transfers, error }
}
