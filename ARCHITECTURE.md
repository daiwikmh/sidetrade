# SIDETRADE DApp - Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         SIDETRADE DApp                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Telegram   │◄────────┤   Backend    │────────►│  SideShift   │
│     User     │         │   Server     │         │     API      │
└──────────────┘         └──────┬───────┘         └──────────────┘
                                │
                                │ REST API
                                │
                         ┌──────▼───────┐
                         │   Frontend   │
                         │  (React UI)  │
                         └──────────────┘
                                ▲
                                │
                         ┌──────┴───────┐
                         │   Web User   │
                         └──────────────┘
```

## Component Architecture

### Backend Server (Node.js + Express)

```
server/index.js
├── Express App (Port 3001)
│   ├── CORS Middleware
│   ├── JSON Body Parser
│   └── API Routes
│       ├── GET  /api/health
│       ├── GET  /api/pairs
│       ├── GET  /api/coins
│       ├── GET  /api/quote/:from/:to
│       ├── POST /api/shifts/fixed
│       └── GET  /api/shifts/:id
│
├── Telegram Bot Integration
│   └── bot/telegramBot.js
│       ├── Command Handlers
│       │   ├── /start
│       │   ├── /help
│       │   ├── /pairs
│       │   ├── /coins
│       │   ├── /quote
│       │   ├── /subscribe
│       │   ├── /unsubscribe
│       │   └── /status
│       │
│       ├── Subscriber Management (Map)
│       └── Broadcast System
│
└── SideShift Service
    └── services/sideshiftService.js
        ├── API Client (Axios)
        ├── getCoins()
        ├── getPairs()
        ├── getQuote()
        ├── createFixedOrder()
        ├── createVariableOrder()
        ├── getShiftStatus()
        └── getPopularPairs()
```

### Frontend (React + TypeScript)

```
client/src/
├── main.tsx
│   └── QueryClientProvider
│       └── BrowserRouter
│           └── App
│
├── App.tsx
│   └── Routes
│       ├── / (Layout)
│       │   ├── Dashboard
│       │   ├── Markets
│       │   └── Swap
│
├── components/
│   └── Layout.tsx
│       ├── Header (Logo, Status, Bot Link)
│       ├── Navigation (Dashboard, Markets, Swap)
│       ├── Outlet (Page Content)
│       └── Footer (Links, Credits)
│
├── pages/
│   ├── Dashboard.tsx
│   │   ├── Hero Section
│   │   ├── Stats Grid
│   │   ├── Popular Pairs
│   │   └── Features
│   │
│   ├── Markets.tsx
│   │   ├── Search Bar
│   │   ├── Refresh Button
│   │   └── Pairs Table/Cards
│   │
│   └── Swap.tsx
│       ├── From Input
│       ├── Swap Button
│       ├── To Input
│       ├── Quote Display
│       └── Telegram Link
│
└── services/
    └── api.ts
        ├── API Client
        └── Methods
            ├── health()
            ├── getPairs()
            ├── getCoins()
            ├── getQuote()
            └── getSubscribers()
```

## Data Flow

### 1. Real-Time Market Updates

```
┌─────────────────┐
│  Cron Timer     │ Every 30s
│  (setInterval)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  updateMarketData()     │
│  - Fetch popular pairs  │
│  - Update cache         │
│  - Store lastUpdate     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Check Subscribers      │
│  - If count > 0         │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  broadcastUpdate()      │
│  - Format message       │
│  - Send to all users    │
└─────────────────────────┘
```

### 2. User Request Flow

```
┌──────────────┐
│  User Action │ (Click, Command)
└──────┬───────┘
       │
       ▼
┌──────────────────┐         ┌──────────────────┐
│  Frontend Page   │ ─API──► │  Backend Route   │
│  - React Query   │ ◄──────  │  - Express       │
└──────────────────┘         └────────┬─────────┘
       │                              │
       │                              ▼
       │                     ┌──────────────────┐
       │                     │  SideShift API   │
       │                     │  - Fetch Data    │
       │                     └────────┬─────────┘
       │                              │
       ▼                              ▼
┌──────────────────┐         ┌──────────────────┐
│  Display Result  │ ◄──────  │  Return Response │
└──────────────────┘         └──────────────────┘
```

### 3. Telegram Bot Flow

```
┌──────────────┐
│  User sends  │
│  /command    │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  Telegram Bot API    │
│  - Receive message   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Command Handler     │
│  - Parse command     │
│  - Extract params    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  SideShift Service   │
│  - Fetch data        │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Format Response     │
│  - Markdown message  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Send to Telegram    │
│  - bot.sendMessage() │
└──────────────────────┘
```

## State Management

### Backend State

```javascript
// In-Memory Storage
{
  marketData: {
    popularPairs: Array<Pair>,
    lastUpdate: Date
  },

  subscribers: Map<UserId, {
    chatId: number,
    username: string,
    subscribedAt: Date
  }>
}
```

### Frontend State

```typescript
// React Query Cache
{
  queries: {
    ['health']: HealthStatus,
    ['pairs']: Pair[],
    ['coins']: Coin[],
    ['quote', from, to]: Quote
  }
}

// Local Component State
{
  searchTerm: string,
  fromCoin: string,
  toCoin: string,
  amount: string
}
```

## API Contracts

### SideShift API → Backend

```javascript
// Request
GET https://sideshift.ai/api/v2/pairs
Headers: {
  'x-sideshift-secret': API_KEY
}

// Response
[
  {
    coin: "eth",
    name: "Ethereum",
    networks: ["ethereum"],
    hasMemo: false,
    ...
  }
]
```

### Backend → Frontend

```javascript
// Request
GET http://localhost:3001/api/pairs

// Response
{
  data: [
    {
      deposit: "eth",
      settle: "btc",
      pair: "ETH/BTC",
      rate: "0.035874690427",
      depositMin: "0.003936283634",
      depositMax: "13.29825552"
    }
  ],
  cached: true,
  lastUpdate: "2025-10-05T19:07:36.278Z"
}
```

## Performance Optimizations

### Backend
- ✅ Request caching (1 minute TTL)
- ✅ Parallel pair fetching
- ✅ Error handling without blocking
- ✅ Subscriber map for O(1) lookup

### Frontend
- ✅ React Query caching (30s stale time)
- ✅ Automatic refetching
- ✅ Loading states
- ✅ Optimistic UI updates

## Security Layers

```
┌─────────────────────────────────────┐
│  Environment Variables (.env)       │
│  - Bot Token                        │
│  - API Keys                         │
└─────────────────────────────────────┘
                ▼
┌─────────────────────────────────────┐
│  CORS Configuration                 │
│  - Allow frontend origin            │
└─────────────────────────────────────┘
                ▼
┌─────────────────────────────────────┐
│  Input Validation                   │
│  - Route parameters                 │
│  - Request body                     │
└─────────────────────────────────────┘
                ▼
┌─────────────────────────────────────┐
│  Error Handling                     │
│  - Try/catch blocks                 │
│  - User-friendly messages           │
└─────────────────────────────────────┘
```

## Deployment Architecture

### Development

```
┌──────────────┐     ┌──────────────┐
│  Vite Dev    │     │  Node Server │
│  :5173       │────►│  :3001       │────►SideShift API
└──────────────┘     └──────┬───────┘
                             │
                             └────────────►Telegram API
```

### Production

```
┌──────────────┐     ┌──────────────┐
│  Vercel/     │     │  Railway/    │
│  Netlify     │────►│  Render      │────►SideShift API
│  (Static)    │     │  (Server)    │
└──────────────┘     └──────┬───────┘
                             │
                             └────────────►Telegram API
```

## Scalability Considerations

### Current Limitations
- In-memory subscribers (lost on restart)
- No rate limiting
- Single server instance
- No database

### Future Improvements
- Add Redis for subscriber persistence
- Implement rate limiting
- Add database (PostgreSQL)
- Support horizontal scaling
- Add message queue (RabbitMQ)
- Cache layer (Redis)

## Technology Stack Summary

```
┌─────────────────────────────────────┐
│            Frontend                 │
│  React 19 + TypeScript + Vite      │
│  TailwindCSS + React Query         │
└─────────────────────────────────────┘
                ▲
                │ HTTP/REST
                ▼
┌─────────────────────────────────────┐
│            Backend                  │
│  Node.js + Express                 │
│  node-telegram-bot-api + Axios     │
└─────────────────────────────────────┘
                ▲
                │ HTTPS
                ▼
┌─────────────────────────────────────┐
│         External APIs               │
│  SideShift.ai v2 API               │
│  Telegram Bot API                  │
└─────────────────────────────────────┘
```

---

**Architecture Pattern:** Client-Server with External API Integration
**Communication:** REST API + WebSocket (Telegram polling)
**Data Flow:** Request-Response + Push Notifications
