import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SIDESHIFT_API_URL = process.env.SIDESHIFT_API_URL || 'https://sideshift.ai/api/v2';
const SIDESHIFT_API_KEY = process.env.SIDESHIFT_API_KEY;
const SIDESHIFT_AFFILIATE_ID = process.env.SIDESHIFT_AFFILIATE_ID;

class SideShiftService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: SIDESHIFT_API_URL,
      headers: {
        'Content-Type': 'application/json',
        'x-sideshift-secret': SIDESHIFT_API_KEY
      }
    });
  }

  /**
   * Get all available coins/tokens supported by SideShift
   */
  async getCoins() {
    try {
      const response = await this.apiClient.get('/coins');
      return response.data;
    } catch (error) {
      console.error('Error fetching coins:', error.message);
      throw error;
    }
  }

  /**
   * Get available pairs for a specific deposit coin
   */
  async getPairs(depositCoin = null) {
    try {
      const url = depositCoin ? `/pairs/${depositCoin}` : '/pairs';
      const response = await this.apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching pairs:', error.message);
      throw error;
    }
  }

  /**
   * Get quote for a specific pair using POST /quotes
   */
  async getQuote(depositCoin, settleCoin, depositNetwork = null, settleNetwork = null, depositAmount = null, settleAmount = null) {
    try {
      const data = {
        depositCoin: depositCoin.toUpperCase(),
        settleCoin: settleCoin.toUpperCase(),
        affiliateId: SIDESHIFT_AFFILIATE_ID
      };

      // Add networks if provided
      if (depositNetwork) data.depositNetwork = depositNetwork.toLowerCase();
      if (settleNetwork) data.settleNetwork = settleNetwork.toLowerCase();

      // Add amounts if provided
      if (depositAmount) data.depositAmount = depositAmount.toString();
      if (settleAmount) data.settleAmount = settleAmount.toString();

      const response = await this.apiClient.post('/quotes', data);
      return response.data;
    } catch (error) {
      console.error('Error fetching quote:', error.message);
      throw error;
    }
  }

  /**
   * Get simple pair rate (backwards compatibility for popular pairs)
   */
  async getPairRate(depositCoin, settleCoin) {
    try {
      const depositCoinUpper = depositCoin.toUpperCase();
      const settleCoinUpper = settleCoin.toUpperCase();

      const response = await this.apiClient.get(`/pair/${depositCoinUpper}/${settleCoinUpper}`, {
        params: { affiliateId: SIDESHIFT_AFFILIATE_ID }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching pair rate:', error.message);
      throw error;
    }
  }

  /**
   * Create a fixed rate shift order
   */
  async createFixedOrder(depositCoin, settleCoin, settleAddress, depositAmount, affiliateId = null) {
    try {
      const data = {
        depositCoin,
        settleCoin,
        settleAddress,
        depositAmount,
        type: 'fixed'
      };

      // Use affiliate ID from env if not provided
      data.affiliateId = affiliateId || SIDESHIFT_AFFILIATE_ID;

      const response = await this.apiClient.post('/shifts/fixed', data);
      return response.data;
    } catch (error) {
      console.error('Error creating fixed order:', error.message);
      throw error;
    }
  }

  /**
   * Create a variable rate shift order
   */
  async createVariableOrder(depositCoin, settleCoin, settleAddress, affiliateId = null) {
    try {
      const data = {
        depositCoin,
        settleCoin,
        settleAddress,
        type: 'variable'
      };

      // Use affiliate ID from env if not provided
      data.affiliateId = affiliateId || SIDESHIFT_AFFILIATE_ID;

      const response = await this.apiClient.post('/shifts/variable', data);
      return response.data;
    } catch (error) {
      console.error('Error creating variable order:', error.message);
      throw error;
    }
  }

  /**
   * Get shift order status by ID
   */
  async getShiftStatus(shiftId) {
    try {
      const response = await this.apiClient.get(`/shifts/${shiftId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching shift status:', error.message);
      throw error;
    }
  }

  /**
   * Get permissions for the current API key
   */
  async getPermissions() {
    try {
      const response = await this.apiClient.get('/permissions');
      return response.data;
    } catch (error) {
      console.error('Error fetching permissions:', error.message);
      throw error;
    }
  }

  /**
   * Get coin icon SVG
   */
  async getCoinIcon(coin, network = null) {
    try {
      // Format: coin-network (e.g., eth-ethereum, btc-bitcoin)
      const coinIdentifier = network ? `${coin}-${network}` : coin;

      const response = await this.apiClient.get(`/coins/icon/${coinIdentifier}`, {
        headers: {
          'Accept': 'image/svg+xml'
        },
        responseType: 'text'
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching coin icon:', error.message);
      throw error;
    }
  }

  /**
   * Format coin data for display
   */
  formatCoinData(coin) {
    return {
      coin: coin.coin,
      name: coin.name,
      networks: coin.networks || [],
      hasMemo: coin.hasMemo || false,
      fixedOnly: coin.fixedOnly || false,
      variableOnly: coin.variableOnly || false
    };
  }

  /**
   * Format quote data for display
   */
  formatQuoteData(quote) {
    // Handle both /pair response and /quotes response
    return {
      pair: `${quote.depositCoin}/${quote.settleCoin}`,
      rate: quote.rate,
      depositMin: quote.min || quote.depositMin,
      depositMax: quote.max || quote.depositMax,
      depositAmount: quote.depositAmount,
      settleAmount: quote.settleAmount,
      depositNetwork: quote.depositNetwork,
      settleNetwork: quote.settleNetwork,
      depositCoin: quote.depositCoin,
      settleCoin: quote.settleCoin
    };
  }

  /**
   * Get popular trading pairs with rates
   */
  async getPopularPairs() {
    try {
      // Use pairs that work without network specification (mainnet coins)
      const popularPairs = [
        { deposit: 'btc', settle: 'eth' },
        { deposit: 'eth', settle: 'btc' },
        { deposit: 'btc', settle: 'sol' },
        { deposit: 'eth', settle: 'sol' },
        { deposit: 'sol', settle: 'btc' },
        { deposit: 'sol', settle: 'eth' },
        { deposit: 'ltc', settle: 'btc' },
        { deposit: 'doge', settle: 'btc' }
      ];

      const pairPromises = popularPairs.map(async (pair) => {
        try {
          // Use getPairRate for popular pairs (backwards compatible)
          const quote = await this.getPairRate(pair.deposit, pair.settle);
          return {
            ...pair,
            ...this.formatQuoteData(quote)
          };
        } catch (error) {
          return null;
        }
      });

      const results = await Promise.all(pairPromises);
      return results.filter(pair => pair !== null);
    } catch (error) {
      console.error('Error fetching popular pairs:', error.message);
      throw error;
    }
  }
}

export default new SideShiftService();
