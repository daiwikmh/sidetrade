import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SIDESHIFT_API_URL = process.env.SIDESHIFT_API_URL || 'https://sideshift.ai/api/v2';
const SIDESHIFT_API_KEY = process.env.SIDESHIFT_API_KEY;

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
   * Get quote for a specific pair
   */
  async getQuote(depositCoin, settleCoin, depositAmount = null, settleAmount = null) {
    try {
      const params = {};
      if (depositAmount) params.depositAmount = depositAmount;
      if (settleAmount) params.settleAmount = settleAmount;

      const response = await this.apiClient.get(`/pair/${depositCoin}/${settleCoin}`, {
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching quote:', error.message);
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

      if (affiliateId) {
        data.affiliateId = affiliateId;
      }

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

      if (affiliateId) {
        data.affiliateId = affiliateId;
      }

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
    return {
      pair: `${quote.depositCoin}/${quote.settleCoin}`,
      rate: quote.rate,
      depositMin: quote.min,
      depositMax: quote.max,
      depositAmount: quote.depositAmount,
      settleAmount: quote.settleAmount
    };
  }

  /**
   * Get popular trading pairs with rates
   */
  async getPopularPairs() {
    try {
      const popularPairs = [
        { deposit: 'usdc', settle: 'eth' },
        { deposit: 'usdc', settle: 'sol' },
        { deposit: 'usdc', settle: 'btc' },
        { deposit: 'eth', settle: 'usdc' },
        { deposit: 'eth', settle: 'btc' },
        { deposit: 'btc', settle: 'eth' },
        { deposit: 'btc', settle: 'usdc' },
        { deposit: 'sol', settle: 'usdc' }
      ];

      const pairPromises = popularPairs.map(async (pair) => {
        try {
          const quote = await this.getQuote(pair.deposit, pair.settle);
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
