import { useQuery } from '@tanstack/react-query'
import { apiService } from '../services/api'
import { TrendingUp, Users, Activity, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { data: pairs, isLoading: pairsLoading } = useQuery({
    queryKey: ['pairs'],
    queryFn: () => apiService.getPairs(),
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: () => apiService.health(),
    refetchInterval: 10000,
  })

  const stats = [
    {
      label: 'Active Subscribers',
      value: health?.subscribers || 0,
      icon: Users,
      color: 'text-blue-500',
    },
    {
      label: 'Trading Pairs',
      value: pairs?.length || 0,
      icon: TrendingUp,
      color: 'text-green-500',
    },
    {
      label: 'Bot Status',
      value: health?.bot === 'running' ? 'Online' : 'Offline',
      icon: Activity,
      color: health?.bot === 'running' ? 'text-green-500' : 'text-red-500',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold gradient-text">
          Welcome to sidetradeShift
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your gateway to seamless cross-chain token swaps. Monitor real-time rates and execute swaps via our Telegram DApp.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <Link
            to="/swap"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Start Swapping
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="https://t.me/sidetradeshift_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
          >
            Open Telegram Bot
          </a>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <Icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Popular Pairs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Popular Trading Pairs</h2>
          <Link
            to="/markets"
            className="text-sm text-primary hover:underline"
          >
            View All Markets
          </Link>
        </div>

        {pairsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-lg p-6 animate-pulse"
              >
                <div className="h-6 bg-muted rounded w-1/3 mb-4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pairs?.slice(0, 6).map((pair, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold uppercase">
                      {pair.deposit}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-lg font-bold uppercase">
                      {pair.settle}
                    </span>
                  </div>
                  <div className="text-sm text-green-500 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rate:</span>
                    <span className="font-mono font-medium">{pair.rate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Range:</span>
                    <span className="font-mono text-xs">
                      {pair.depositMin} - {pair.depositMax}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary mb-4">
            <Activity className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Real-Time Updates</h3>
          <p className="text-sm text-muted-foreground">
            Get instant notifications on price changes and market movements via Telegram
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary mb-4">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Best Rates</h3>
          <p className="text-sm text-muted-foreground">
            Powered by SideShift.ai to ensure competitive rates across multiple chains
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary mb-4">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Easy to Use</h3>
          <p className="text-sm text-muted-foreground">
            Simple Telegram interface for monitoring and executing swaps on the go
          </p>
        </div>
      </div>
    </div>
  )
}
