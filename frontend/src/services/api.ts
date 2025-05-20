import { createAppError, ErrorCodes } from '../utils/errorHandling';
import { API_BASE_URL, API_VERSION } from '../constants';

// API endpoint paths
export const API_ENDPOINTS = {
  // Mixer endpoints
  POOLS: '/mixer/pools',
  POOL_INFO: (tokenMint: string, depositAmount: string) => `/mixer/pool/${tokenMint}/${depositAmount}`,
  DEPOSIT: '/mixer/deposit',
  WITHDRAW: '/mixer/withdraw',
  
  // Bridge endpoints
  CHAINS: '/bridge/chains',
  CHAIN_INFO: (chainId: number) => `/bridge/chain/${chainId}`,
  TOKEN_PAIRS: '/bridge/token-pairs',
  TOKEN_PAIR_INFO: (sourceChainId: number, targetChainId: number, targetTokenMint: string) => 
    `/bridge/token-pair/${sourceChainId}/${targetChainId}/${targetTokenMint}`,
  LOCK_TOKENS: '/bridge/lock-tokens',
  
  // Transaction history
  TRANSACTIONS: (walletAddress: string) => `/transactions/${walletAddress}`,
};

// Request options type
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  withAuth?: boolean;
}

/**
 * Formats and returns the complete API URL
 * @param endpoint - API endpoint path
 * @returns Complete API URL
 */
export const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}/api/${API_VERSION}${endpoint}`;
};

/**
 * Creates a timeout promise for fetch requests
 * @param ms - Timeout in milliseconds
 * @returns Promise that rejects after specified timeout
 */
const timeoutPromise = (ms: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timed out after ${ms}ms`));
    }, ms);
  });
};

/**
 * Gets authentication headers using wallet connection
 * @returns Object with auth headers
 */
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  // This is a placeholder for the actual wallet authentication implementation
  // In a real app, you would use the wallet to sign a message and get an auth token
  
  // Example (pseudocode):
  // const wallet = window.solana;
  // const message = `Authenticate to MIYA: ${Date.now()}`;
  // const signature = await wallet.signMessage(new TextEncoder().encode(message));
  // return {
  //   'x-auth-wallet': wallet.publicKey.toString(),
  //   'x-auth-signature': signature,
  //   'x-auth-message': message,
  // };
  
  return {}; // Placeholder empty auth headers
};

/**
 * Makes an API request with error handling
 * @param endpoint - API endpoint
 * @param options - Request options
 * @returns Promise resolving to the API response
 */
export const apiRequest = async<T>(
  endpoint: string, 
  options: RequestOptions = {}
): Promise<T> => {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = 30000,
    withAuth = false,
  } = options;
  
  try {
    // Prepare headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };
    
    // Add auth headers if needed
    if (withAuth) {
      const authHeaders = await getAuthHeaders();
      Object.assign(requestHeaders, authHeaders);
    }
    
    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    };
    
    // Make the request with timeout
    const response = await Promise.race([
      fetch(getApiUrl(endpoint), requestOptions),
      timeoutPromise(timeout),
    ]);
    
    // Handle non-OK responses
    if (!response.ok) {
      // Try to parse error response
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }
      
      // Map HTTP status codes to error codes
      let errorCode = ErrorCodes.UNEXPECTED_ERROR;
      
      switch (response.status) {
        case 400:
          errorCode = ErrorCodes.INVALID_INPUT;
          break;
        case 401:
          errorCode = ErrorCodes.UNAUTHORIZED;
          break;
        case 404:
          errorCode = ErrorCodes.INVALID_INPUT;
          break;
        case 500:
          errorCode = ErrorCodes.CONTRACT_ERROR;
          break;
      }
      
      throw createAppError({
        code: errorCode,
        message: errorData.message || `API Error (${response.status})`,
        details: errorData,
      });
    }
    
    // Parse and return the data
    const data = await response.json();
    return data as T;
  } catch (error) {
    // Convert and rethrow the error
    if (error instanceof Error && error.name === 'AbortError') {
      throw createAppError(error, ErrorCodes.REQUEST_TIMEOUT);
    }
    
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      throw createAppError(error, ErrorCodes.NETWORK_ERROR);
    }
    
    throw error;
  }
};

// API convenience methods
export const get = <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> => {
  return apiRequest<T>(endpoint, { ...options, method: 'GET' });
};

export const post = <T>(endpoint: string, data: any, options?: Omit<RequestOptions, 'method'>): Promise<T> => {
  return apiRequest<T>(endpoint, { ...options, method: 'POST', body: data });
};

export const put = <T>(endpoint: string, data: any, options?: Omit<RequestOptions, 'method'>): Promise<T> => {
  return apiRequest<T>(endpoint, { ...options, method: 'PUT', body: data });
};

export const del = <T>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<T> => {
  return apiRequest<T>(endpoint, { ...options, method: 'DELETE' });
};

export default {
  get,
  post,
  put,
  del,
  API_ENDPOINTS,
  getApiUrl,
}; 