import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { apiService, type ShiftResponse } from '../services/api'
import { ArrowDownUp, Info, Copy, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'

export default function Swap() {
  const [fromCoin, setFromCoin] = useState('eth')
  const [toCoin, setToCoin] = useState('usdc')
  const [fromNetwork, setFromNetwork] = useState('ethereum')
  const [toNetwork, setToNetwork] = useState('ethereum')
  const [amount, setAmount] = useState('')
  const [settleAddress, setSettleAddress] = useState('')
  const [shift, setShift] = useState<ShiftResponse | null>(null)
  const [copied, setCopied] = useState(false)

  const { data: coins, isLoading: coinsLoading } = useQuery({
    queryKey: ['coins'],
    queryFn: () => apiService.getCoins(),
  })

  // Get networks for selected coins
  const fromCoinData = coins?.find(c => c.coin.toLowerCase() === fromCoin.toLowerCase())
  const toCoinData = coins?.find(c => c.coin.toLowerCase() === toCoin.toLowerCase())

  const { data: quote } = useQuery({
    queryKey: ['quote', fromCoin, toCoin, fromNetwork, toNetwork, amount],
    queryFn: () => apiService.getQuote(
      fromCoin,
      toCoin,
      fromNetwork,
      toNetwork,
      amount ? parseFloat(amount) : undefined
    ),
    enabled: fromCoin !== '' && toCoin !== '' && fromNetwork !== '' && toNetwork !== '',
  })

  const createShiftMutation = useMutation({
    mutationFn: () => apiService.createShift({
      depositCoin: fromCoin,
      settleCoin: toCoin,
      depositNetwork: fromNetwork,
      settleNetwork: toNetwork,
      settleAddress: settleAddress,
      depositAmount: amount || undefined,
    }),
    onSuccess: (data) => {
      setShift(data)
    },
  })

  const handleSwapCoins = () => {
    const tempCoin = fromCoin
    const tempNetwork = fromNetwork
    setFromCoin(toCoin)
    setFromNetwork(toNetwork)
    setToCoin(tempCoin)
    setToNetwork(tempNetwork)
  }

  const handleCreateSwap = async () => {
    if (!settleAddress.trim()) {
      alert('Please enter your receiving address')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    if (quote && parseFloat(amount) < parseFloat(quote.depositMin)) {
      alert(`Minimum amount is ${quote.depositMin} ${fromCoin.toUpperCase()}`)
      return
    }

    if (quote && parseFloat(amount) > parseFloat(quote.depositMax)) {
      alert(`Maximum amount is ${quote.depositMax} ${fromCoin.toUpperCase()}`)
      return
    }

    createShiftMutation.mutate()
  }

  const handleCopyAddress = () => {
    if (shift?.depositAddress) {
      navigator.clipboard.writeText(shift.depositAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleReset = () => {
    setShift(null)
    setAmount('')
    setSettleAddress('')
    createShiftMutation.reset()
  }

  const outputAmount = amount && quote?.rate
    ? (parseFloat(amount) * parseFloat(quote.rate)).toFixed(6)
    : '0.00'

  // If shift is created, show the deposit instructions
  if (shift) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Swap Created!</h1>
          <p className="text-muted-foreground">
            Send your {fromCoin.toUpperCase()} to the address below to complete the swap
          </p>
        </div>

        {/* Swap Summary */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-center gap-2 text-green-500">
            <CheckCircle2 className="h-6 w-6" />
            <span className="font-semibold">Swap Order Created</span>
          </div>

          {/* Swap Details */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">You Send:</span>
              <span className="font-semibold">
                {amount} {fromCoin.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">You Receive:</span>
              <span className="font-semibold">
                ≈ {outputAmount} {toCoin.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rate:</span>
              <span className="font-mono text-sm">
                1 {fromCoin.toUpperCase()} = {shift.rate} {toCoin.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Deposit Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Deposit Address</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shift.depositAddress}
                readOnly
                className="flex-1 bg-background border border-border rounded-lg px-4 py-3 font-mono text-sm"
              />
              <button
                onClick={handleCopyAddress}
                className="px-4 py-3 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
              >
                {copied ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Send exactly {amount} {fromCoin.toUpperCase()} to this address
            </p>
          </div>

          {/* Receiving Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Receiving Address</label>
            <div className="bg-background border border-border rounded-lg px-4 py-3">
              <p className="font-mono text-sm break-all">{shift.settleAddress}</p>
            </div>
          </div>

          {/* Order ID */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Order ID</label>
            <div className="bg-background border border-border rounded-lg px-4 py-3">
              <p className="font-mono text-sm">{shift.id}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Save this ID to track your swap
            </p>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 text-sm bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-yellow-500" />
            <div className="space-y-1">
              <p className="font-medium text-yellow-500">Important</p>
              <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                <li>Send only {fromCoin.toUpperCase()} to this address</li>
                <li>Minimum: {shift.depositMin} {fromCoin.toUpperCase()}</li>
                <li>Maximum: {shift.depositMax} {fromCoin.toUpperCase()}</li>
                <li>This order expires at {new Date(shift.expiresAt).toLocaleString()}</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleReset}
              className="flex-1 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
            >
              Create New Swap
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Swap Tokens</h1>
        <p className="text-muted-foreground">
          Cross-chain token swaps powered by SideShift.ai
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
              <div className="flex gap-2">
                <select
                  value={fromCoin}
                  onChange={(e) => {
                    setFromCoin(e.target.value)
                    const coin = coins?.find(c => c.coin.toLowerCase() === e.target.value.toLowerCase())
                    if (coin && coin.networks.length > 0) {
                      setFromNetwork(coin.networks[0])
                    }
                  }}
                  disabled={coinsLoading}
                  className="bg-secondary text-foreground px-4 py-2 rounded-lg font-semibold uppercase cursor-pointer outline-none hover:bg-secondary/80 transition-colors"
                >
                  {coinsLoading ? (
                    <option>Loading...</option>
                  ) : (
                    coins?.slice(0, 100).map((coin) => (
                      <option key={coin.coin} value={coin.coin.toLowerCase()}>
                        {coin.coin.toUpperCase()}
                      </option>
                    ))
                  )}
                </select>
                {fromCoinData && fromCoinData.networks.length > 1 && (
                  <select
                    value={fromNetwork}
                    onChange={(e) => setFromNetwork(e.target.value)}
                    className="bg-background border border-border px-3 py-2 rounded-lg text-sm cursor-pointer outline-none"
                    title="Network"
                  >
                    {fromCoinData.networks.map((network) => (
                      <option key={network} value={network}>
                        {network}
                      </option>
                    ))}
                  </select>
                )}
              </div>
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
              <div className="flex gap-2">
                <select
                  value={toCoin}
                  onChange={(e) => {
                    setToCoin(e.target.value)
                    const coin = coins?.find(c => c.coin.toLowerCase() === e.target.value.toLowerCase())
                    if (coin && coin.networks.length > 0) {
                      setToNetwork(coin.networks[0])
                    }
                  }}
                  disabled={coinsLoading}
                  className="bg-secondary text-foreground px-4 py-2 rounded-lg font-semibold uppercase cursor-pointer outline-none hover:bg-secondary/80 transition-colors"
                >
                  {coinsLoading ? (
                    <option>Loading...</option>
                  ) : (
                    coins?.slice(0, 100).map((coin) => (
                      <option key={coin.coin} value={coin.coin.toLowerCase()}>
                        {coin.coin.toUpperCase()}
                      </option>
                    ))
                  )}
                </select>
                {toCoinData && toCoinData.networks.length > 1 && (
                  <select
                    value={toNetwork}
                    onChange={(e) => setToNetwork(e.target.value)}
                    className="bg-background border border-border px-3 py-2 rounded-lg text-sm cursor-pointer outline-none"
                    title="Network"
                  >
                    {toCoinData.networks.map((network) => (
                      <option key={network} value={network}>
                        {network}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Receiving Address */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">
            Your {toCoin.toUpperCase()} Receiving Address
          </label>
          <div className="bg-background border border-border rounded-lg p-4">
            <input
              type="text"
              placeholder={`Enter your ${toCoin.toUpperCase()} wallet address`}
              value={settleAddress}
              onChange={(e) => setSettleAddress(e.target.value)}
              className="w-full bg-transparent text-sm font-mono outline-none placeholder:text-muted-foreground"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            The address where you'll receive your {toCoin.toUpperCase()}
          </p>
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

        {/* Error */}
        {createShiftMutation.isError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Failed to create swap</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {createShiftMutation.error?.message || 'An error occurred. Please try again.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleCreateSwap}
          disabled={createShiftMutation.isPending || !settleAddress.trim() || !amount || parseFloat(amount) <= 0}
          className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createShiftMutation.isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Creating Swap...
            </>
          ) : (
            'Create Swap'
          )}
        </button>

        {/* Info */}
        <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            No registration required. After creating the swap, you'll receive a deposit address. Send your tokens to complete the exchange.
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
