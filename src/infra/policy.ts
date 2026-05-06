import {
  bulkhead,
  circuitBreaker,
  CircuitState,
  ConsecutiveBreaker,
  ExponentialBackoff,
  handleAll,
  retry,
} from "cockatiel";
import { env } from "./env";
import { getLogger } from "./logger";

const { resiliency } = env;

const logger = getLogger("resiliency");

export const circuitBreakerPolicy = circuitBreaker(handleAll, {
  halfOpenAfter: resiliency.circuitBreaker.halfOpenAfter,
  breaker: new ConsecutiveBreaker(
    resiliency.circuitBreaker.maxConsecutiveFails,
  ),
});

circuitBreakerPolicy.onStateChange((state) =>
  logger.info({ policy: "Circut Breaker", state: CircuitState[state] }),
);

export const retryPolicy = retry(handleAll, {
  maxAttempts: resiliency.retry.maxAttempts,
  backoff: new ExponentialBackoff({
    maxDelay: resiliency.retry.maxDelay,
  })
})

retryPolicy.onRetry(event => {
  logger.warn({
    policy: 'retry',
    attempt: event.attempt,
    delay: event.delay,
  })
})

export const bulkheadPolicy = bulkhead(
  resiliency.bulkhead.size,
  resiliency.bulkhead.queue,
);
