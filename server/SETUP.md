# sidetradeShift DApp - Setup Guide

## Quick Start

### 1. Install Dependencies

**Backend:**
```bash
npm install
```

**Client:**
```bash
cd client
npm install
cd ..
```

### 2. Configuration

Your `.env` file is already configured with:
- Telegram Bot Token: `8302633822:AAHYDKVH2JKkdTNsmYk3CxAqGnPIaz8FdNE`
- Bot Name: `sidetradeshift_bot`
- SideShift API Key: `2819c53d260130d733ed080910167693`

### 3. Run the Application

**Terminal 1 - Start Backend:**
```bash
npm start
```

Expected output:
```
✅ sidetradeShift Telegram Bot is running...
📱 Bot username: @sidetradeshift_bot
🚀 sidetradeShift API Server running on port 3001
📡 API available at http://localhost:3001
🤖 Telegram Bot: @sidetradeshift_bot
🔄 Updating market data...
✅ Updated 8 pairs at [timestamp]
⏱️  Market data updates every 30s
```

**Terminal 2 - Start Frontend:**
```bash
npm run client
```

Expected output:
```
VITE v5.x.x ready in xxx ms
➜  Local:   http://localhost:5173/
```

### 4. Access the Application

- **Web Dashboard**: http://localhost:5173
- **API**: http://localhost:3001
- **Telegram Bot**: https://t.me/sidetradeshift_bot

## Project Structure

```
sidetrade/
├── .env                          # Environment configuration (with API keys)
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── package.json                  # Backend dependencies
├── README.md                     # Project documentation
├── SETUP.md                      # This file
├── start.sh                      # Quick start script
│
├── server/                       # Backend (Node.js + Express)
│   ├── index.js                  # Main server with API routes
│   ├── bot/
│   │   └── telegramBot.js       # Telegram bot implementation
│   └── services/
│       └── sideshiftService.js  # SideShift API integration
│
└── client/                       # Frontend (React + TypeScript)
    ├── .env.local                # Frontend environment config
    ├── .env.example              # Frontend environment template
    ├── package.json              # Frontend dependencies
    ├── vite.config.ts            # Vite configuration
    ├── tsconfig.json             # TypeScript configuration
    ├── index.html                # HTML entry point
    │
    └── src/
        ├── main.tsx              # React entry point
        ├── App.tsx               # Main app component
        ├── index.css             # Global styles
        │
        ├── components/
        │   └── Layout.tsx        # Main layout with nav
        │
        ├── pages/
        │   ├── Dashboard.tsx     # Dashboard page
        │   ├── Markets.tsx       # Markets listing page
        │   └── Swap.tsx          # Swap interface page
        │
        └── services/
            └── api.ts            # API client service
```

## Testing the Bot

### 1. Open Telegram
Search for `@sidetradeshift_bot` or visit: https://t.me/sidetradeshift_bot

### 2. Start the Bot
Send: `/start`

You should see:
```
🚀 Welcome to sidetradeShift DApp!

Your gateway to seamless cross-chain token swaps powered by SideShift.ai

What I can do:
✅ Show real-time exchange rates
✅ Display popular trading pairs
✅ Provide swap quotes
✅ Send price update notifications

Get started with /help to see all commands!
```

### 3. Try Commands

**View popular pairs:**
```
/pairs
```

**Get a quote:**
```
/quote eth usdc
```

**Subscribe to updates:**
```
/subscribe
```

**Check status:**
```
/status
```

## API Endpoints

Test the API directly:

### Health Check
```bash
curl http://localhost:3001/api/health
```

### Get Popular Pairs
```bash
curl http://localhost:3001/api/pairs
```

### Get All Coins
```bash
curl http://localhost:3001/api/coins
```

### Get Quote
```bash
curl http://localhost:3001/api/quote/eth/usdc
```

### With Amount
```bash
curl http://localhost:3001/api/quote/eth/usdc?amount=1
```

## Frontend Pages

### Dashboard (/)
- Overview with statistics
- Popular trading pairs
- Feature highlights
- Direct Telegram bot link

### Markets (/markets)
- Full list of trading pairs
- Real-time rates
- Search functionality
- Min/max amounts

### Swap (/swap)
- Quote calculator
- Coin selector
- Amount input
- Link to complete swap in Telegram

## Features

### Backend Features
✅ Telegram bot with commands
✅ SideShift API integration
✅ Real-time data updates (30s intervals)
✅ Subscriber management
✅ REST API endpoints
✅ Graceful shutdown handling
✅ Error handling & logging

### Frontend Features
✅ Modern, responsive UI
✅ React Query for data fetching
✅ Auto-refresh capabilities
✅ Loading states
✅ Search functionality
✅ Real-time subscriber count
✅ Telegram bot integration

### Telegram Bot Features
✅ Interactive commands
✅ Custom keyboard
✅ Real-time quotes
✅ Subscription system
✅ Broadcast updates
✅ User-friendly messages

## Customization

### Update Intervals

Edit `.env`:
```env
PRICE_UPDATE_INTERVAL=30000   # 30 seconds
MARKET_UPDATE_INTERVAL=60000  # 60 seconds
```

### Popular Pairs

Edit `server/services/sideshiftService.js` in `getPopularPairs()`:
```javascript
const popularPairs = [
  { deposit: 'usdc', settle: 'eth' },
  { deposit: 'btc', settle: 'eth' },
  // Add more pairs...
];
```

### Frontend API URL

Edit `client/.env.local`:
```env
VITE_API_URL=http://localhost:3001/api
```

## Troubleshooting

### Bot Not Responding
1. Check backend is running: `curl http://localhost:3001/api/health`
2. Verify bot token in `.env`
3. Check server logs for errors

### No Data Showing
1. Check SideShift API key is valid
2. Verify internet connection
3. Check browser console for errors

### CORS Errors
1. Ensure backend is running on port 3001
2. Check `VITE_API_URL` in client/.env.local
3. Restart both backend and frontend

## Production Deployment

### Backend
1. Set environment variables on your host
2. Deploy to Railway/Render/Heroku
3. Update frontend `VITE_API_URL` to production URL

### Frontend
1. Build: `cd client && npm run build`
2. Deploy `client/dist` to Vercel/Netlify
3. Set `VITE_API_URL` environment variable

## SideShift API Documentation

- API v2 Docs: https://docs.sideshift.ai/endpoints/v2/
- Getting Started: https://docs.sideshift.ai/api-intro/getting-started

## Support

If you encounter issues:
1. Check server logs
2. Verify environment variables
3. Test API endpoints directly
4. Check Telegram bot logs

## Next Steps

### Recommended Enhancements
- [ ] Add wallet connection (MetaMask)
- [ ] Implement actual swap execution
- [ ] Add transaction history
- [ ] Add price charts
- [ ] Add more notification types
- [ ] Add user preferences
- [ ] Add rate alerts
- [ ] Add multi-language support

Enjoy using sidetradeShift DApp! 🚀
