// Error Utilities for Luma Mobile

// Error categories
export const ErrorCategory = {
  NETWORK: 'network',
  TIMEOUT: 'timeout',
  SERVER: 'server',
  CLIENT: 'client',
  WEBSOCKET: 'websocket',
  STORAGE: 'storage',
  UNKNOWN: 'unknown',
};

// User-friendly messages per category
export const ErrorMessages = {
  [ErrorCategory.NETWORK]: {
    title: 'Connection Failed',
    message: 'Unable to reach the server. Make sure the server is running and the URL is correct.',
    retryable: true,
  },
  [ErrorCategory.TIMEOUT]: {
    title: 'Connection Timed Out',
    message: 'The server is not responding. It may be offline or the URL may be incorrect.',
    retryable: true,
  },
  [ErrorCategory.SERVER]: {
    title: 'Server Error',
    message: 'The server encountered an error. Please try again.',
    retryable: true,
  },
  [ErrorCategory.CLIENT]: {
    title: 'Invalid Request',
    message: 'There was a problem with the request.',
    retryable: false,
  },
  [ErrorCategory.WEBSOCKET]: {
    title: 'Connection Lost',
    message: 'Real-time connection lost. Attempting to reconnect...',
    retryable: true,
  },
  [ErrorCategory.STORAGE]: {
    title: 'Storage Error',
    message: 'Failed to save or load data locally.',
    retryable: true,
  },
  [ErrorCategory.UNKNOWN]: {
    title: 'Connection Error',
    message: 'Something went wrong. Please try again.',
    retryable: true,
  },
};

// AppError class with structured error info
export class AppError extends Error {
  constructor(category, originalError = null, customMessage = null) {
    const errorInfo = ErrorMessages[category] || ErrorMessages[ErrorCategory.UNKNOWN];
    super(customMessage || errorInfo.message);

    this.name = 'AppError';
    this.category = category;
    this.title = errorInfo.title;
    this.retryable = errorInfo.retryable;
    this.originalError = originalError;
    this.timestamp = Date.now();
  }

  // Get user-friendly display info
  getDisplayInfo() {
    return {
      title: this.title,
      message: this.message,
      retryable: this.retryable,
      category: this.category,
    };
  }
}

// Categorize errors from HTTP status or exceptions
export function categorizeError(error, status = null) {
  // HTTP status code categorization
  if (status) {
    if (status === 408) return ErrorCategory.TIMEOUT;
    if (status >= 400 && status < 500) return ErrorCategory.CLIENT;
    if (status >= 500) return ErrorCategory.SERVER;
  }

  // Exception-based categorization
  if (error) {
    const message = error.message?.toLowerCase() || '';
    const name = error.name?.toLowerCase() || '';

    // Network errors
    if (
      name === 'typeerror' ||
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('failed to fetch') ||
      message.includes('network request failed') ||
      message.includes('unable to connect') ||
      message.includes('no internet') ||
      message.includes('offline')
    ) {
      return ErrorCategory.NETWORK;
    }

    // Timeout errors
    if (
      name === 'aborterror' ||
      message.includes('timeout') ||
      message.includes('aborted') ||
      message.includes('timed out')
    ) {
      return ErrorCategory.TIMEOUT;
    }

    // WebSocket errors
    if (
      message.includes('websocket') ||
      message.includes('socket')
    ) {
      return ErrorCategory.WEBSOCKET;
    }

    // Storage errors
    if (
      message.includes('storage') ||
      message.includes('asyncstorage') ||
      message.includes('quota')
    ) {
      return ErrorCategory.STORAGE;
    }
  }

  return ErrorCategory.UNKNOWN;
}

// Calculate exponential backoff delay
export function calculateBackoffDelay(attempt, baseDelay = 1000, maxDelay = 30000) {
  // Exponential backoff with jitter: delay = min(maxDelay, baseDelay * 2^attempt * (0.5 + random * 0.5))
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = 0.5 + Math.random() * 0.5; // Random between 0.5 and 1
  const delay = Math.min(maxDelay, exponentialDelay * jitter);
  return Math.floor(delay);
}

// Sleep utility for delay between retries
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Check if an HTTP status code is retryable
export function isRetryableStatus(status) {
  const retryableStatuses = [408, 429, 500, 502, 503, 504];
  return retryableStatuses.includes(status);
}

// Wrap an error as AppError if it isn't already
export function wrapError(error, category = null) {
  if (error instanceof AppError) {
    return error;
  }

  const determinedCategory = category || categorizeError(error);
  return new AppError(determinedCategory, error);
}

export default {
  ErrorCategory,
  ErrorMessages,
  AppError,
  categorizeError,
  calculateBackoffDelay,
  sleep,
  isRetryableStatus,
  wrapError,
};
