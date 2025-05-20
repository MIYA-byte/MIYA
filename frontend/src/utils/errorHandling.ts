/**
 * Error handling utilities for MIYA frontend application
 */

// Error type for consistent error structure across the application
export interface AppError {
  code: string;
  message: string;
  details?: any;
  originalError?: Error;
}

// Known error codes for frontend application
export enum ErrorCodes {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  REQUEST_TIMEOUT = 'REQUEST_TIMEOUT',
  
  // Authentication errors
  WALLET_CONNECTION_FAILED = 'WALLET_CONNECTION_FAILED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  WALLET_SIGNATURE_REJECTED = 'WALLET_SIGNATURE_REJECTED',
  
  // Transaction errors
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  SLIPPAGE_EXCEEDED = 'SLIPPAGE_EXCEEDED',
  
  // Smart contract errors
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  INVALID_STATE = 'INVALID_STATE',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Application errors
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR'
}

// Error messages for UI display
export const errorMessages: Record<ErrorCodes, string> = {
  [ErrorCodes.NETWORK_ERROR]: 'Network connection error. Please check your internet connection.',
  [ErrorCodes.REQUEST_TIMEOUT]: 'Request timed out. Please try again.',
  
  [ErrorCodes.WALLET_CONNECTION_FAILED]: 'Failed to connect wallet. Please try again.',
  [ErrorCodes.UNAUTHORIZED]: 'You need to connect your wallet to access this feature.',
  [ErrorCodes.WALLET_SIGNATURE_REJECTED]: 'You rejected the signature request. Transaction cancelled.',
  
  [ErrorCodes.TRANSACTION_FAILED]: 'Transaction failed. Please try again.',
  [ErrorCodes.INSUFFICIENT_FUNDS]: 'Insufficient funds for transaction.',
  [ErrorCodes.SLIPPAGE_EXCEEDED]: 'Price changed beyond slippage tolerance. Please try again.',
  
  [ErrorCodes.CONTRACT_ERROR]: 'Smart contract execution error.',
  [ErrorCodes.INVALID_STATE]: 'Invalid state for operation.',
  
  [ErrorCodes.VALIDATION_ERROR]: 'Validation error. Please check your inputs.',
  [ErrorCodes.INVALID_INPUT]: 'Invalid input. Please check your inputs.',
  
  [ErrorCodes.UNEXPECTED_ERROR]: 'An unexpected error occurred. Please try again later.'
};

/**
 * Creates an AppError from different error types
 * @param error - The original error
 * @param defaultCode - Default error code if not determined
 * @returns Standardized AppError
 */
export const createAppError = (
  error: unknown,
  defaultCode = ErrorCodes.UNEXPECTED_ERROR
): AppError => {
  // Already an AppError
  if (isAppError(error)) {
    return error;
  }
  
  // Standard Error
  if (error instanceof Error) {
    const appError: AppError = {
      code: defaultCode,
      message: error.message || errorMessages[defaultCode],
      originalError: error
    };
    
    // Extract more details from specific error types
    
    // Network error
    if (error.name === 'NetworkError' || error.message.includes('network')) {
      appError.code = ErrorCodes.NETWORK_ERROR;
      appError.message = errorMessages[ErrorCodes.NETWORK_ERROR];
    }
    
    // Timeout error
    if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
      appError.code = ErrorCodes.REQUEST_TIMEOUT;
      appError.message = errorMessages[ErrorCodes.REQUEST_TIMEOUT];
    }
    
    return appError;
  }
  
  // String error
  if (typeof error === 'string') {
    return {
      code: defaultCode,
      message: error || errorMessages[defaultCode]
    };
  }
  
  // Unknown error type
  return {
    code: defaultCode,
    message: errorMessages[defaultCode],
    details: error
  };
};

/**
 * Type guard to check if an error is an AppError
 * @param error - The error to check
 * @returns Boolean indicating if error is an AppError
 */
export const isAppError = (error: unknown): error is AppError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
};

/**
 * Handles wallet connection errors
 * @param error - The original error from wallet connection
 * @returns Standardized AppError for wallet connection
 */
export const handleWalletError = (error: unknown): AppError => {
  const appError = createAppError(error, ErrorCodes.WALLET_CONNECTION_FAILED);
  
  // Check for signature rejection
  if (
    error instanceof Error &&
    (error.message.includes('user rejected') || error.message.includes('cancelled'))
  ) {
    appError.code = ErrorCodes.WALLET_SIGNATURE_REJECTED;
    appError.message = errorMessages[ErrorCodes.WALLET_SIGNATURE_REJECTED];
  }
  
  return appError;
};

/**
 * Handles transaction errors
 * @param error - The original transaction error
 * @returns Standardized AppError for transaction
 */
export const handleTransactionError = (error: unknown): AppError => {
  const appError = createAppError(error, ErrorCodes.TRANSACTION_FAILED);
  
  // Extract specific transaction error types if available
  if (error instanceof Error) {
    // Insufficient funds
    if (error.message.includes('insufficient') || error.message.includes('balance')) {
      appError.code = ErrorCodes.INSUFFICIENT_FUNDS;
      appError.message = errorMessages[ErrorCodes.INSUFFICIENT_FUNDS];
    }
    
    // Slippage error
    if (error.message.includes('slippage') || error.message.includes('price impact')) {
      appError.code = ErrorCodes.SLIPPAGE_EXCEEDED;
      appError.message = errorMessages[ErrorCodes.SLIPPAGE_EXCEEDED];
    }
  }
  
  return appError;
};

/**
 * Creates a validation error
 * @param message - Error message
 * @param details - Validation details
 * @returns Validation AppError
 */
export const createValidationError = (message: string, details?: any): AppError => {
  return {
    code: ErrorCodes.VALIDATION_ERROR,
    message: message || errorMessages[ErrorCodes.VALIDATION_ERROR],
    details
  };
};

/**
 * Logs an error to console and optional error tracking service
 * @param error - The error to log
 * @param context - Additional context information
 */
export const logError = (error: unknown, context?: Record<string, any>): void => {
  const appError = isAppError(error) ? error : createAppError(error);
  
  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', appError.code, appError.message, {
      details: appError.details,
      originalError: appError.originalError,
      context
    });
  }
  
  // TODO: Add integration with error tracking service (e.g., Sentry)
  // if (process.env.NODE_ENV === 'production') {
  //   // Send to error tracking service
  // }
};

export default {
  createAppError,
  isAppError,
  handleWalletError,
  handleTransactionError,
  createValidationError,
  logError,
  ErrorCodes,
  errorMessages
}; 