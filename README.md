# sidetradeShift DApp

A real-time cross-chain token swap monitoring application powered by SideShift.ai API with Telegram bot integration.

## Features

- 🔄 Real-time exchange rate updates from SideShift.ai
- 🤖 Telegram bot interface for easy monitoring and notifications
- 📊 Web dashboard for viewing markets and swap quotes
- 🔔 Subscribe to periodic price updates via Telegram
- ⚡ Cross-chain swap support for multiple cryptocurrencies
- 🎨 Modern, responsive UI built with React and Tailwind CSS

## Project Structure

```
sidetrade/
├── server/              # Backend Node.js server
│   ├── bot/            # Telegram bot implementation
│   │   └── telegramBot.js
│   ├── services/       # API services
│   │   └── sideshiftService.js
│   └── index.js        # Main server entry point
├── client/             # Frontend React application
│   └── src/
│       ├── components/ # React components
│       ├── pages/      # Page components
│       ├── services/   # API client services
│       └── App.tsx     # Main App component
└── package.json        # Root dependencies
```

## Prerequisites

- Node.js v18 or higher
- npm or yarn
- Telegram account (for bot access)

## Installation

### 1. Install Backend Dependencies

```bash
npm install
```

### 2. Install Client Dependencies

```bash
cd client
npm install
cd ..
```

### 3. Configure Environment Variables

The `.env` file in the root directory contains:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_BOT_NAME=sidetradeshift_bot

# SideShift API Configuration
SIDESHIFT_API_KEY=your_sideshift_api_key
SIDESHIFT_API_URL=https://sideshift.ai/api/v2

# Server Configuration
PORT=3001
NODE_ENV=development

# Update Intervals (in milliseconds)
PRICE_UPDATE_INTERVAL=30000
MARKET_UPDATE_INTERVAL=60000
```

## Running the Application

### Development Mode

**Start the backend server:**
```bash
npm start
```

The server will run on `http://localhost:3001`

**In a separate terminal, start the client:**
```bash
npm run client
```

The React app will run on `http://localhost:5173`

### Production Build

**Build the client:**
```bash
npm run build
```

**Start the server:**
```bash
npm start
```

## Telegram Bot Usage

### Available Commands

- `/start` - Initialize the bot and see welcome message
- `/help` - Show all available commands
- `/pairs` - View popular trading pairs with live rates
- `/coins` - List all supported cryptocurrencies
- `/quote <from> <to>` - Get exchange rate quote
  - Example: `/quote eth usdc`
- `/subscribe` - Subscribe to periodic price updates
- `/unsubscribe` - Unsubscribe from updates
- `/status` - Check your subscription status

### Getting Started with the Bot

1. Open Telegram
2. Search for `@sidetradeshift_bot`
3. Send `/start` to begin
4. Use `/pairs` to see popular trading pairs
5. Use `/subscribe` to get real-time updates

## API Endpoints

The backend provides the following REST API endpoints:

### Health & Status
- `GET /api/health` - Server health check
- `GET /api/subscribers` - Get subscriber count

### Market Data
- `GET /api/pairs` - Get all popular trading pairs
- `GET /api/coins` - Get all supported coins
- `GET /api/quote/:from/:to` - Get quote for specific pair
  - Query params: `?amount=<number>` (optional)

### Shift Operations
- `POST /api/shifts/fixed` - Create a fixed rate shift order
- `GET /api/shifts/:id` - Get shift order status

## Features in Detail

### Real-Time Updates
- Market data updates every 30 seconds
- Automatic broadcasting to subscribed Telegram users
- Cached responses for better performance

### SideShift Integration
- Full API v2 support
- Fixed and variable rate swaps
- Support for 100+ cryptocurrencies
- Cross-chain compatibility

### Web Dashboard
- **Dashboard**: Overview with stats and popular pairs
- **Markets**: Full list of trading pairs with search
- **Swap**: Get quotes and initiate swaps via Telegram

## Technology Stack

### Backend
- Node.js with ES Modules
- Express.js for REST API
- node-telegram-bot-api for Telegram integration
- Axios for HTTP requests
- dotenv for environment management

### Frontend
- React 19 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- React Query for data fetching
- React Router for navigation
- Lucide React for icons

## Configuration

### Updating Price Intervals

Modify the `.env` file:

```env
PRICE_UPDATE_INTERVAL=30000  # 30 seconds
MARKET_UPDATE_INTERVAL=60000 # 60 seconds
```

### API Limits

The SideShift API has rate limits. The application includes:
- Caching mechanism (1 minute cache for pairs)
- Request throttling
- Error handling and retry logic

## Deployment

### Backend Deployment

1. Set environment variables on your hosting platform
2. Install dependencies: `npm install`
3. Start the server: `npm start`

### Frontend Deployment

1. Update `VITE_API_URL` in `client/.env.local`
2. Build: `cd client && npm run build`
3. Deploy the `client/dist` folder to your static hosting

### Recommended Platforms

- **Backend**: Railway, Render, Heroku, DigitalOcean
- **Frontend**: Vercel, Netlify, Cloudflare Pages

## Security

- API keys are stored in environment variables
- No sensitive data in git repository
- CORS configured for production
- Input validation on all endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Support

For issues or questions:
- Open an issue on GitHub
- Contact via Telegram: @sidetradeshift_bot

## Acknowledgments

- Powered by [SideShift.ai](https://sideshift.ai)
- Built with [Telegram Bot API](https://core.telegram.org/bots/api)
- UI components from [Radix UI](https://www.radix-ui.com/)
