import { Outlet, Link, useLocation } from 'react-router-dom'
import { BarChart3, Repeat, Home, ExternalLink } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { apiService } from '../services/api'

export default function Layout() {
  const location = useLocation()

  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: () => apiService.health(),
    refetchInterval: 10000, // Refetch every 10 seconds
  })

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/markets', label: 'Markets', icon: BarChart3 },
    { path: '/swap', label: 'Swap', icon: Repeat },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Repeat className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">SIDETRADE</h1>
                <p className="text-xs text-muted-foreground">Cross-Chain DApp</p>
              </div>
            </div>

            {/* Status indicator */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm">
                <div className={`h-2 w-2 rounded-full ${health?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                <span className="text-muted-foreground">
                  {health?.subscribers || 0} subscribers
                </span>
              </div>

              <a
                href="https://t.me/yurishift_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Open Telegram Bot
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                    isActive
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>Powered by SideShift.ai API</p>
            <div className="flex items-center gap-4">
              <a
                href="https://docs.sideshift.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                API Docs
              </a>
              <span>•</span>
              <a
                href="https://t.me/yurishift_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Telegram Bot
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
