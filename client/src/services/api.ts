const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Coin {
  coin: string;
  name: string;
  networks: string[];
  hasMemo: boolean;
  fixedOnly: boolean;
  variableOnly: boolean;
}

export interface Pair {
  deposit: string;
  settle: string;
  pair: string;
  rate: string;
  depositMin: string;
  depositMax: string;
  depositAmount?: string;
  settleAmount?: string;
}

export interface Quote {
  pair: string;
  rate: string;
  depositMin: string;
  depositMax: string;
  depositAmount?: string;
  settleAmount?: string;
}

export interface HealthStatus {
  status: string;
  bot: string;
  subscribers: number;
  lastUpdate: string;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async fetchJson<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  }

  async health(): Promise<HealthStatus> {
    return this.fetchJson<HealthStatus>('/health');
  }

  async getPairs(): Promise<Pair[]> {
    const response = await this.fetchJson<{ data: Pair[] }>('/pairs');
    return response.data;
  }

  async getCoins(): Promise<Coin[]> {
    const response = await this.fetchJson<{ data: Coin[] }>('/coins');
    return response.data;
  }

  async getQuote(from: string, to: string, amount?: number): Promise<Quote> {
    const url = amount
      ? `/quote/${from}/${to}?amount=${amount}`
      : `/quote/${from}/${to}`;
    const response = await this.fetchJson<{ data: Quote }>(url);
    return response.data;
  }

  async getSubscribers(): Promise<number> {
    const response = await this.fetchJson<{ count: number }>('/subscribers');
    return response.count;
  }
}

export const apiService = new ApiService();
