export const env = {
  port: process.env.PORT ?? 9999,
  paymentsServiceUrl: {
    default:
      process.env.PAYMENT_PROCESSOR_URL_DEFAULT ?? "http://localhost:8001",
    fallback:
      process.env.PAYMENT_PROCESSOR_URL_FALLBACK ?? "http://localhost:8002",
  },
  env: process.env.NODE_ENV ?? "local",
} as const;
