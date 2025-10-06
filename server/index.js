import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import SIDETRADEBot from './bot/telegramBot.js';
import sideshiftService from './services/sideshiftService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Telegram Bot
const bot = new SIDETRADEBot();
bot.start();

// Store latest market data
let marketData = {
  popularPairs: [],
  lastUpdate: null
};

// Periodic update function
async function updateMarketData() {
  try {
    console.log('🔄 Updating market data...');
    const pairs = await sideshiftService.getPopularPairs();

    marketData.popularPairs = pairs;
    marketData.lastUpdate = new Date();

    console.log(`✅ Updated ${pairs.length} pairs at ${marketData.lastUpdate.toISOString()}`);

    // Broadcast to subscribers if there are significant changes
    if (bot.getSubscriberCount() > 0) {
      const updateMessage = formatMarketUpdate(pairs);
      await bot.broadcastUpdate(updateMessage);
    }
  } catch (error) {
    console.error('❌ Error updating market data:', error.message);
  }
}

// Format market update message for Telegram
function formatMarketUpdate(pairs) {
  const topPairs = pairs.slice(0, 5);

  let message = '📈 *Market Update*\n\n';

  topPairs.forEach((pair, index) => {
    message += `${index + 1}. ${pair.deposit.toUpperCase()}→${pair.settle.toUpperCase()}: \`${pair.rate}\`\n`;
  });

  message += `\n_Updated: ${new Date().toLocaleTimeString()}_`;

  return message;
}

// API Routes
app.get('/', (req, res) => {
  res.json({
    name: 'SIDETRADE DApp API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      pairs: '/api/pairs',
      coins: '/api/coins',
      coinIcon: '/api/coins/icon/:coin?network=:network',
      getQuote: 'GET /api/quote/:from/:to',
      postQuote: 'POST /api/quote (with networks)',
      subscribers: '/api/subscribers',
      createShift: 'POST /api/shifts',
      createFixedShift: 'POST /api/shifts/fixed',
      createVariableShift: 'POST /api/shifts/variable',
      getShiftStatus: '/api/shifts/:id'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    bot: 'running',
    subscribers: bot.getSubscriberCount(),
    lastUpdate: marketData.lastUpdate
  });
});

// Get popular pairs
app.get('/api/pairs', async (req, res) => {
  try {
    if (marketData.popularPairs.length > 0 && marketData.lastUpdate) {
      // Return cached data if recent (less than 1 minute old)
      const cacheAge = Date.now() - marketData.lastUpdate.getTime();
      if (cacheAge < 60000) {
        return res.json({
          data: marketData.popularPairs,
          cached: true,
          lastUpdate: marketData.lastUpdate
        });
      }
    }

    const pairs = await sideshiftService.getPopularPairs();
    res.json({
      data: pairs,
      cached: false,
      lastUpdate: new Date()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch pairs',
      message: error.message
    });
  }
});

// Get all supported coins
app.get('/api/coins', async (req, res) => {
  try {
    const coins = await sideshiftService.getCoins();
    res.json({
      data: coins,
      count: coins.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch coins',
      message: error.message
    });
  }
});

// Get coin icon
app.get('/api/coins/icon/:coin', async (req, res) => {
  try {
    const { coin } = req.params;
    const { network } = req.query;

    const icon = await sideshiftService.getCoinIcon(coin.toLowerCase(), network?.toLowerCase());

    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(icon);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch coin icon',
      message: error.message
    });
  }
});

// Get quote for specific pair (POST for network support)
app.post('/api/quote', async (req, res) => {
  try {
    const { depositCoin, settleCoin, depositNetwork, settleNetwork, depositAmount, settleAmount } = req.body;

    if (!depositCoin || !settleCoin) {
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['depositCoin', 'settleCoin']
      });
    }

    const quote = await sideshiftService.getQuote(
      depositCoin,
      settleCoin,
      depositNetwork,
      settleNetwork,
      depositAmount,
      settleAmount
    );

    res.json({
      data: sideshiftService.formatQuoteData(quote)
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch quote',
      message: error.message
    });
  }
});

// Get quote for specific pair (GET - backwards compatible, uses simple pair endpoint)
app.get('/api/quote/:from/:to', async (req, res) => {
  try {
    const { from, to } = req.params;
    const { amount, depositNetwork, settleNetwork } = req.query;

    const quote = await sideshiftService.getQuote(
      from.toLowerCase(),
      to.toLowerCase(),
      depositNetwork,
      settleNetwork,
      amount ? parseFloat(amount) : null,
      null
    );

    res.json({
      data: sideshiftService.formatQuoteData(quote)
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch quote',
      message: error.message
    });
  }
});

// Get subscriber count
app.get('/api/subscribers', (req, res) => {
  res.json({
    count: bot.getSubscriberCount()
  });
});

// Create shift order (POST) - supports both fixed and variable
app.post('/api/shifts', async (req, res) => {
  try {
    const { depositCoin, settleCoin, settleAddress, depositAmount, affiliateId } = req.body;

    if (!depositCoin || !settleCoin || !settleAddress) {
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['depositCoin', 'settleCoin', 'settleAddress']
      });
    }

    // Create variable order if no depositAmount specified, otherwise fixed
    let order;
    if (depositAmount) {
      order = await sideshiftService.createFixedOrder(
        depositCoin,
        settleCoin,
        settleAddress,
        depositAmount,
        affiliateId
      );
    } else {
      order = await sideshiftService.createVariableOrder(
        depositCoin,
        settleCoin,
        settleAddress,
        affiliateId
      );
    }

    res.json({ data: order });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to create shift order',
      message: error.message
    });
  }
});

// Create fixed shift order (POST)
app.post('/api/shifts/fixed', async (req, res) => {
  try {
    const { depositCoin, settleCoin, settleAddress, depositAmount, affiliateId } = req.body;

    if (!depositCoin || !settleCoin || !settleAddress || !depositAmount) {
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['depositCoin', 'settleCoin', 'settleAddress', 'depositAmount']
      });
    }

    const order = await sideshiftService.createFixedOrder(
      depositCoin,
      settleCoin,
      settleAddress,
      depositAmount,
      affiliateId
    );

    res.json({ data: order });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to create shift order',
      message: error.message
    });
  }
});

// Create variable shift order (POST)
app.post('/api/shifts/variable', async (req, res) => {
  try {
    const { depositCoin, settleCoin, settleAddress, affiliateId } = req.body;

    if (!depositCoin || !settleCoin || !settleAddress) {
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['depositCoin', 'settleCoin', 'settleAddress']
      });
    }

    const order = await sideshiftService.createVariableOrder(
      depositCoin,
      settleCoin,
      settleAddress,
      affiliateId
    );

    res.json({ data: order });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to create shift order',
      message: error.message
    });
  }
});

// Get shift status
app.get('/api/shifts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const status = await sideshiftService.getShiftStatus(id);
    res.json({ data: status });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch shift status',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SIDETRADE API Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}`);
  console.log(`🤖 Telegram Bot: @${process.env.TELEGRAM_BOT_NAME}`);

  // Initial data fetch
  updateMarketData();
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  bot.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  bot.stop();
  process.exit(0);
});
