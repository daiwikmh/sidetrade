# SIDETRADE DApp - Quick Start ⚡

## 🚀 Start in 3 Steps

### 1. Install (first time only)
```bash
# Install backend dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..
```

### 2. Run Backend
```bash
npm start
```
✅ Server will start on http://localhost:3001
✅ Telegram bot will activate

### 3. Run Frontend (in new terminal)
```bash
npm run client
```
✅ Web app will start on http://localhost:5173

## 📱 Access Points

| Service | URL |
|---------|-----|
| Web Dashboard | http://localhost:5173 |
| API Server | http://localhost:3001 |
| Telegram Bot | https://t.me/yurishift_bot |

## 🤖 Telegram Bot Commands

```
/start          - Initialize bot
/pairs          - View trading pairs
/quote eth usdc - Get rate quote
/subscribe      - Enable updates
/help           - Show all commands
```

## 🧪 Test the API

```bash
# Health check
curl http://localhost:3001/api/health

# Get pairs
curl http://localhost:3001/api/pairs

# Get quote
curl http://localhost:3001/api/quote/eth/usdc
```

## 📁 Project Structure

```
sidetrade/
├── server/              # Backend (Node.js)
│   ├── index.js        # Main server
│   ├── bot/            # Telegram bot
│   └── services/       # SideShift API
│
└── client/             # Frontend (React)
    └── src/
        ├── pages/      # Dashboard, Markets, Swap
        └── services/   # API client
```

## 🔧 Configuration

All API keys are already configured in `.env`:
- ✅ Telegram Bot Token
- ✅ SideShift API Key

## 📚 Documentation

- **Full Setup:** See SETUP.md
- **Complete Guide:** See README.md
- **Summary:** See PROJECT_SUMMARY.md

## 🆘 Troubleshooting

**Backend won't start:**
```bash
npm install
```

**Frontend won't start:**
```bash
cd client && npm install && cd ..
```

**Bot not responding:**
Check server logs and verify bot is running

## ✨ Features

- 📊 Real-time exchange rates
- 🔔 Telegram notifications
- 💱 Swap quotes
- 🔍 Coin search
- 📈 Market tracking

---

**Ready to use!** Start with `npm start` 🎉
