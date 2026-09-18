import { useMemo } from 'react'
import { usePulse } from './usePulse'
import { ARC_TESTNET } from './arcConfig'

const WAVE_W = 900
const WAVE_H = 160

function buildPath(history) {
  if (history.length < 2) return ''
  const min = Math.min(...history)
  const max = Math.max(...history)
  const range = max - min || 1
  const step = WAVE_W / (history.length - 1)
  return history
    .map((v, i) => {
      const x = i * step
      const y = WAVE_H - 20 - ((v - min) / range) * (WAVE_H - 40)
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

export default function App() {
  const { status, blockNumber, blockTime, gasGwei, gasHistory, transfers, error } = usePulse()

  const path = useMemo(() => buildPath(gasHistory), [gasHistory])

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">Arc Pulse</span>
          <span className="brand-sub">live network vitals</span>
        </div>
        <div className={`status status--${status}`}>
          <span className="status-dot" />
          {status === 'live' && 'reading Arc Testnet'}
          {status === 'connecting' && 'connecting…'}
          {status === 'error' && 'connection lost'}
        </div>
      </header>

      <section className="hero">
        <div className="hero-readout">
          <span className="hero-value">
            {gasGwei !== null ? gasGwei.toFixed(2) : '—'}
          </span>
          <span className="hero-unit">gwei · gas price</span>
        </div>
        <svg
          className="wave"
          viewBox={`0 0 ${WAVE_W} ${WAVE_H}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <line x1="0" y1={WAVE_H / 2} x2={WAVE_W} y2={WAVE_H / 2} className="wave-mid" />
          {path && <path d={path} className="wave-path" />}
        </svg>
      </section>

      <main className="panels">
        <section className="panel vitals">
          <h2>Vitals</h2>
          <dl>
            <div className="vital-row">
              <dt>Block height</dt>
              <dd>{blockNumber ?? '—'}</dd>
            </div>
            <div className="vital-row">
              <dt>Last block interval</dt>
              <dd>{blockTime ? `${blockTime}s` : '—'}</dd>
            </div>
            <div className="vital-row">
              <dt>Gas asset</dt>
              <dd>USDC</dd>
            </div>
            <div className="vital-row">
              <dt>Chain ID</dt>
              <dd>{ARC_TESTNET.chainId}</dd>
            </div>
          </dl>
          {error && <p className="error">{error}</p>}
        </section>

        <section className="panel feed">
          <h2>USDC activity</h2>
          {transfers.length === 0 ? (
            <p className="feed-empty">Watching for transfers on-chain…</p>
          ) : (
            <ul className="feed-list">
              {transfers.map((t) => (
                <li key={t.id} className="feed-item">
                  <span className="feed-amount">{t.amount.toFixed(2)} USDC</span>
                  <span className="feed-path">
                    {t.from} → {t.to}
                  </span>
                  <a
                    className="feed-link"
                    href={`${ARC_TESTNET.explorerUrl}/tx/${t.hash}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    block {t.blockNumber}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="footer">
        <span>Arc Testnet</span>
        <span className="footer-sep">·</span>
        <a href={ARC_TESTNET.explorerUrl} target="_blank" rel="noreferrer">
          ArcScan
        </a>
        <span className="footer-sep">·</span>
        <span>read-only, no wallet required</span>
      </footer>
    </div>
  )
}
