import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiService } from '../services/api'
import { ArrowDownUp, ExternalLink, Info } from 'lucide-react'

export default function Swap() {
  const [fromCoin, setFromCoin] = useState('eth')
  const [toCoin, setToCoin] = useState('usdc')
  const [amount, setAmount] = useState('')

  const { data: coins, isLoading: coinsLoading } = useQuery({
    queryKey: ['coins'],
    queryFn: () => apiService.getCoins(),
  })

  const { data: quote } = useQuery({
    queryKey: ['quote', fromCoin, toCoin, amount],
    queryFn: () => apiService.getQuote(fromCoin, toCoin, amount ? parseFloat(amount) : undefined),
    enabled: fromCoin !== '' && toCoin !== '',
  })

  const handleSwapCoins = () => {
    const temp = fromCoin
    setFromCoin(toCoin)
    setToCoin(temp)
  }

  const outputAmount = amount && quote?.rate
    ? (parseFloat(amount) * parseFloat(quote.rate)).toFixed(6)
    : '0.00'

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Swap Tokens</h1>
        <p className="text-muted-foreground">
          Get quotes and execute swaps via Telegram
        </p>
      </div>

      {/* Swap Card */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        {/* From */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">From</label>
          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center justify-between gap-4">
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 bg-transparent text-2xl font-semibold outline-none"
              />
              <select
                value={fromCoin}
                onChange={(e) => setFromCoin(e.target.value)}
                disabled={coinsLoading}
                className="bg-secondary text-foreground px-4 py-2 rounded-lg font-semibold uppercase cursor-pointer outline-none hover:bg-secondary/80 transition-colors"
              >
                {coinsLoading ? (
                  <option>Loading...</option>
                ) : (
                  coins?.slice(0, 50).map((coin) => (
                    <option key={coin.coin} value={coin.coin}>
                      {coin.coin.toUpperCase()}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-2">
          <button
            onClick={handleSwapCoins}
            className="bg-secondary hover:bg-secondary/80 p-2 rounded-lg transition-colors"
          >
            <ArrowDownUp className="h-5 w-5" />
          </button>
        </div>

        {/* To */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">To</label>
          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center justify-between gap-4">
              <input
                type="text"
                placeholder="0.00"
                value={outputAmount}
                readOnly
                className="flex-1 bg-transparent text-2xl font-semibold outline-none"
              />
              <select
                value={toCoin}
                onChange={(e) => setToCoin(e.target.value)}
                disabled={coinsLoading}
                className="bg-secondary text-foreground px-4 py-2 rounded-lg font-semibold uppercase cursor-pointer outline-none hover:bg-secondary/80 transition-colors"
              >
                {coinsLoading ? (
                  <option>Loading...</option>
                ) : (
                  coins?.slice(0, 50).map((coin) => (
                    <option key={coin.coin} value={coin.coin}>
                      {coin.coin.toUpperCase()}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Quote Info */}
        {quote && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rate:</span>
              <span className="font-mono font-medium">
                1 {fromCoin.toUpperCase()} = {quote.rate} {toCoin.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Min Amount:</span>
              <span className="font-mono">
                {quote.depositMin} {fromCoin.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max Amount:</span>
              <span className="font-mono">
                {quote.depositMax} {fromCoin.toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <a
          href={`https://t.me/sidetradeshift_bot?start=quote_${fromCoin}_${toCoin}${amount ? `_${amount}` : ''}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          Continue on Telegram
          <ExternalLink className="h-5 w-5" />
        </a>

        {/* Info */}
        <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            Swaps are executed via the Telegram bot. Click the button above to continue the process in Telegram with your quote.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 text-center text-xs text-muted-foreground">
        <p>Powered by SideShift.ai • Rates update every 30 seconds</p>
      </div>
    </div>
  )
}
