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
  depositCoin?: string;
  settleCoin?: string;
  depositNetwork?: string;
  settleNetwork?: string;
}

export interface HealthStatus {
  status: string;
  bot: string;
  subscribers: number;
  lastUpdate: string;
}

export interface CreateShiftRequest {
  depositCoin: string;
  settleCoin: string;
  settleAddress: string;
  depositNetwork?: string;
  settleNetwork?: string;
  depositAmount?: string;
  affiliateId?: string;
}

export interface ShiftResponse {
  id: string;
  depositCoin: string;
  settleCoin: string;
  depositAddress: string;
  settleAddress: string;
  depositMin: string;
  depositMax: string;
  rate: string;
  expiresAt: string;
  status: string;
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

  async getQuote(
    from: string,
    to: string,
    fromNetwork?: string,
    toNetwork?: string,
    amount?: number
  ): Promise<Quote> {
    // Use POST endpoint for network-aware quotes
    const response = await fetch(`${this.baseUrl}/quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        depositCoin: from,
        settleCoin: to,
        depositNetwork: fromNetwork,
        settleNetwork: toNetwork,
        depositAmount: amount?.toString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  async getSubscribers(): Promise<number> {
    const response = await this.fetchJson<{ count: number }>('/subscribers');
    return response.count;
  }

  async createShift(request: CreateShiftRequest): Promise<ShiftResponse> {
    const response = await fetch(`${this.baseUrl}/shifts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create shift');
    }

    const data = await response.json();
    return data.data;
  }

  async getShiftStatus(shiftId: string): Promise<ShiftResponse> {
    return this.fetchJson<ShiftResponse>(`/shifts/${shiftId}`);
  }
}

export const apiService = new ApiService();
