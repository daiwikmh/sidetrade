import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import sideshiftService from '../services/sideshiftService.js';

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

class SIDETRADEBot {
  constructor() {
    this.bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
    this.subscribers = new Map(); // Store user subscriptions
    this.initializeCommands();
    this.setupMessageHandlers();
  }

  initializeCommands() {
    // Set bot commands
    this.bot.setMyCommands([
      { command: 'start', description: 'Start the bot and see welcome message' },
      { command: 'help', description: 'Show all available commands' },
      { command: 'pairs', description: 'View popular trading pairs and rates' },
      { command: 'coins', description: 'List all supported coins' },
      { command: 'quote', description: 'Get quote for a pair (e.g., /quote eth usdc)' },
      { command: 'subscribe', description: 'Subscribe to price updates' },
      { command: 'unsubscribe', description: 'Unsubscribe from updates' },
      { command: 'status', description: 'Check your subscription status' }
    ]);
  }

  setupMessageHandlers() {
    // Start command
    this.bot.onText(/\/start/, (msg) => this.handleStart(msg));

    // Help command
    this.bot.onText(/\/help/, (msg) => this.handleHelp(msg));

    // Pairs command - Show popular trading pairs
    this.bot.onText(/\/pairs/, (msg) => this.handlePairs(msg));

    // Coins command - List all supported coins
    this.bot.onText(/\/coins/, (msg) => this.handleCoins(msg));

    // Quote command - Get quote for specific pair
    this.bot.onText(/\/quote(?:\s+(\w+)\s+(\w+))?/, (msg, match) =>
      this.handleQuote(msg, match)
    );

    // Subscribe command
    this.bot.onText(/\/subscribe/, (msg) => this.handleSubscribe(msg));

    // Unsubscribe command
    this.bot.onText(/\/unsubscribe/, (msg) => this.handleUnsubscribe(msg));

    // Status command
    this.bot.onText(/\/status/, (msg) => this.handleStatus(msg));

    // Catch-all for unrecognized messages
    this.bot.on('message', (msg) => {
      if (!msg.text || msg.text.startsWith('/')) return;
      this.handleUnknownMessage(msg);
    });
  }

  async handleStart(msg) {
    const chatId = msg.chat.id;
    const welcomeMessage = `
🚀 *Welcome to SIDETRADE DApp!*

Your gateway to seamless cross-chain token swaps powered by SideShift.ai

*What I can do:*
✅ Show real-time exchange rates
✅ Display popular trading pairs
✅ Provide swap quotes
✅ Send price update notifications

Get started with /help to see all commands!
    `;

    await this.bot.sendMessage(chatId, welcomeMessage, {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: [
          [{ text: '📊 View Pairs' }, { text: '🪙 View Coins' }],
          [{ text: '💱 Get Quote' }, { text: '🔔 Subscribe' }],
          [{ text: '❓ Help' }]
        ],
        resize_keyboard: true
      }
    });
  }

  async handleHelp(msg) {
    const chatId = msg.chat.id;
    const helpMessage = `
📖 *SIDETRADE Bot Commands*

/start - Initialize the bot
/help - Show this help message
/pairs - View popular trading pairs with live rates
/coins - List all supported cryptocurrencies
/quote <from> <to> - Get exchange rate quote
  Example: /quote eth usdc

/subscribe - Get periodic price updates
/unsubscribe - Stop receiving updates
/status - Check your subscription status

*Features:*
🔄 Real-time exchange rates
⚡ Cross-chain swaps
🔔 Price notifications
🛡️ Secure & decentralized
    `;

    await this.bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
  }

  async handlePairs(msg) {
    const chatId = msg.chat.id;

    await this.bot.sendMessage(chatId, '⏳ Fetching popular trading pairs...');

    try {
      const pairs = await sideshiftService.getPopularPairs();

      if (!pairs || pairs.length === 0) {
        await this.bot.sendMessage(chatId, '❌ Unable to fetch pairs at the moment.');
        return;
      }

      let message = '📊 *Popular Trading Pairs*\n\n';

      pairs.forEach((pair, index) => {
        message += `${index + 1}. *${pair.deposit.toUpperCase()} → ${pair.settle.toUpperCase()}*\n`;
        message += `   Rate: \`${pair.rate}\`\n`;
        message += `   Min: ${pair.depositMin} | Max: ${pair.depositMax}\n\n`;
      });

      message += '\n💡 Use /quote <from> <to> for specific quotes';

      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error in handlePairs:', error);
      await this.bot.sendMessage(chatId, '❌ Error fetching pairs. Please try again later.');
    }
  }

  async handleCoins(msg) {
    const chatId = msg.chat.id;

    await this.bot.sendMessage(chatId, '⏳ Fetching supported coins...');

    try {
      const coins = await sideshiftService.getCoins();

      if (!coins || coins.length === 0) {
        await this.bot.sendMessage(chatId, '❌ Unable to fetch coins at the moment.');
        return;
      }

      // Group coins by first letter for better organization
      const coinList = coins.slice(0, 50); // Limit to first 50 to avoid message length issues

      let message = '🪙 *Supported Cryptocurrencies*\n\n';

      coinList.forEach((coin, index) => {
        const coinData = sideshiftService.formatCoinData(coin);
        message += `${index + 1}. *${coinData.coin.toUpperCase()}* - ${coinData.name}\n`;
      });

      message += `\n_Showing ${coinList.length} of ${coins.length} supported coins_\n`;
      message += '\n💡 Use /quote <coin1> <coin2> to get rates';

      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error in handleCoins:', error);
      await this.bot.sendMessage(chatId, '❌ Error fetching coins. Please try again later.');
    }
  }

  async handleQuote(msg, match) {
    const chatId = msg.chat.id;

    if (!match[1] || !match[2]) {
      await this.bot.sendMessage(
        chatId,
        '💡 Usage: /quote <from_coin> <to_coin>\n\nExample: /quote eth usdc'
      );
      return;
    }

    const fromCoin = match[1].toLowerCase();
    const toCoin = match[2].toLowerCase();

    await this.bot.sendMessage(chatId, `⏳ Getting quote for ${fromCoin.toUpperCase()} → ${toCoin.toUpperCase()}...`);

    try {
      const quote = await sideshiftService.getQuote(fromCoin, toCoin);

      const message = `
💱 *Exchange Quote*

*Pair:* ${fromCoin.toUpperCase()} → ${toCoin.toUpperCase()}
*Rate:* \`${quote.rate}\`

*Limits:*
• Min: ${quote.min} ${fromCoin.toUpperCase()}
• Max: ${quote.max} ${fromCoin.toUpperCase()}

*Example:*
Deposit: 1 ${fromCoin.toUpperCase()}
You get: ~${quote.rate} ${toCoin.toUpperCase()}

_Rates update every 30 seconds_
      `;

      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error in handleQuote:', error);
      await this.bot.sendMessage(
        chatId,
        `❌ Unable to get quote for ${fromCoin.toUpperCase()}/${toCoin.toUpperCase()}.\n\nPlease check if both coins are supported using /coins`
      );
    }
  }

  async handleSubscribe(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (this.subscribers.has(userId)) {
      await this.bot.sendMessage(chatId, '✅ You are already subscribed to updates!');
      return;
    }

    this.subscribers.set(userId, {
      chatId,
      username: msg.from.username || msg.from.first_name,
      subscribedAt: new Date()
    });

    const message = `
🔔 *Subscription Activated!*

You will now receive:
• Price updates every 30 seconds
• Market trend notifications
• New pair listings

Use /unsubscribe to stop updates anytime.
    `;

    await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  }

  async handleUnsubscribe(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!this.subscribers.has(userId)) {
      await this.bot.sendMessage(chatId, '❌ You are not currently subscribed.');
      return;
    }

    this.subscribers.delete(userId);
    await this.bot.sendMessage(chatId, '✅ Successfully unsubscribed from updates.');
  }

  async handleStatus(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    const isSubscribed = this.subscribers.has(userId);

    const message = `
📊 *Your Status*

Subscription: ${isSubscribed ? '✅ Active' : '❌ Inactive'}
${isSubscribed ? `Subscribed: ${this.subscribers.get(userId).subscribedAt.toLocaleString()}` : ''}

${!isSubscribed ? 'Use /subscribe to get updates!' : 'Use /unsubscribe to stop updates.'}
    `;

    await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  }

  async handleUnknownMessage(msg) {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Handle custom keyboard buttons
    if (text === '📊 View Pairs') {
      return this.handlePairs(msg);
    } else if (text === '🪙 View Coins') {
      return this.handleCoins(msg);
    } else if (text === '🔔 Subscribe') {
      return this.handleSubscribe(msg);
    } else if (text === '❓ Help') {
      return this.handleHelp(msg);
    } else if (text === '💱 Get Quote') {
      await this.bot.sendMessage(
        chatId,
        '💡 To get a quote, use:\n/quote <from_coin> <to_coin>\n\nExample: /quote eth usdc'
      );
    }
  }

  // Send updates to all subscribers
  async broadcastUpdate(message) {
    for (const [userId, userData] of this.subscribers.entries()) {
      try {
        await this.bot.sendMessage(userData.chatId, message, { parse_mode: 'Markdown' });
      } catch (error) {
        console.error(`Error sending to user ${userId}:`, error.message);
        // Remove subscriber if bot is blocked
        if (error.response && error.response.statusCode === 403) {
          this.subscribers.delete(userId);
        }
      }
    }
  }

  // Get number of active subscribers
  getSubscriberCount() {
    return this.subscribers.size;
  }

  // Start bot
  start() {
    console.log('✅ SIDETRADE Telegram Bot is running...');
    console.log(`📱 Bot username: @${process.env.TELEGRAM_BOT_NAME}`);
  }

  // Stop bot
  stop() {
    this.bot.stopPolling();
    console.log('🛑 Bot stopped');
  }
}

export default SIDETRADEBot;
