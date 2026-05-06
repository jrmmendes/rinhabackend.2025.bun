export const env = {
  logLevel: 'dev',
  port: process.env.PORT ?? 9999,
  paymentsServiceUrl: {
    default:
      process.env.PAYMENT_PROCESSOR_URL_DEFAULT ?? "http://localhost:8001",
    fallback:
      process.env.PAYMENT_PROCESSOR_URL_FALLBACK ?? "http://localhost:8002",
  },
  redis: {
    host: 'redis',
    port: 6379,
  },
  env: process.env.NODE_ENV ?? "local",
  resiliency: {
    bulkhead: {
      size: 10 * 1000,
      queue: 1000,
    },
    retry: {
      maxDelay: 10 * 1000,
      maxAttempts: 25,
    },
    circuitBreaker: {
      maxConsecutiveFails: 50,
      halfOpenAfter: 5 * 1000,
    }
  }
} as const;
