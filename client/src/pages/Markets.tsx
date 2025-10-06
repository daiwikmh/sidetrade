import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiService } from '../services/api'
import { Search, TrendingUp, ArrowRight, RefreshCw } from 'lucide-react'

export default function Markets() {
  const [searchTerm, setSearchTerm] = useState('')

  const { data: pairs, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['pairs'],
    queryFn: () => apiService.getPairs(),
    refetchInterval: 30000,
  })

  const filteredPairs = pairs?.filter((pair) => {
    const search = searchTerm.toLowerCase()
    return (
      pair.deposit.toLowerCase().includes(search) ||
      pair.settle.toLowerCase().includes(search) ||
      pair.pair.toLowerCase().includes(search)
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Markets</h1>
          <p className="text-muted-foreground mt-1">
            Real-time rates for all trading pairs
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search pairs (e.g., ETH, USDC)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Pairs Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-lg p-6 animate-pulse"
            >
              <div className="h-6 bg-muted rounded w-1/3 mb-4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredPairs && filteredPairs.length > 0 ? (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Pair
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">
                    Rate
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">
                    Min Amount
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">
                    Max Amount
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPairs.map((pair, index) => (
                  <tr
                    key={index}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold uppercase">
                          {pair.deposit}
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold uppercase">
                          {pair.settle}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-medium">
                      {pair.rate}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-muted-foreground font-mono">
                      {pair.depositMin}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-muted-foreground font-mono">
                      {pair.depositMax}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 text-green-500">
                        <TrendingUp className="h-4 w-4" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-border">
            {filteredPairs.map((pair, index) => (
              <div key={index} className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold uppercase">
                    {pair.deposit}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg font-semibold uppercase">
                    {pair.settle}
                  </span>
                  <div className="ml-auto text-green-500">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Rate:</span>
                    <span className="ml-2 font-mono font-medium">
                      {pair.rate}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Min:</span>
                    <span className="ml-2 font-mono">
                      {pair.depositMin}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Max:</span>
                    <span className="ml-2 font-mono">
                      {pair.depositMax}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground">
            No pairs found matching "{searchTerm}"
          </p>
        </div>
      )}

      {/* Stats Footer */}
      {filteredPairs && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {filteredPairs.length} of {pairs?.length || 0} trading pairs
        </div>
      )}
    </div>
  )
}
