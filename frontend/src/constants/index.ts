/**
 * Application constants
 */

// Environment
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.miya.baby';
export const API_VERSION = 'v1';

// Blockchain
export const DEFAULT_NETWORK = 'devnet'; // 'mainnet-beta', 'testnet', 'devnet'
export const EXPLORER_URL = 'https://explorer.solana.com';

// UI
export const TOAST_DURATION = 5000; // milliseconds
export const ANIMATION_DURATION = 300; // milliseconds
export const DEFAULT_PAGE_SIZE = 10;

// Storage keys
export const STORAGE_KEYS = {
  THEME: 'theme',
  AUTH_TOKEN: 'auth_token',
  WALLET_CONNECTED: 'wallet_connected',
  RECENT_TRANSACTIONS: 'recent_transactions',
  USER_SETTINGS: 'user_settings'
}; 