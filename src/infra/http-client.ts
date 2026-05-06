import { fallback, handleAll, wrap } from "cockatiel";
import { circuitBreakerPolicy, bulkheadPolicy, retryPolicy } from "./policy";
import { getLogger } from "./logger";
import { env } from "./env";

type ResiliencyOptions = {
  timeout: number;
  maxRetryAttempts: number;
};

type HttpClientConfig = {
  baseUrl: string;
  fallbackUrl: string;
  headers: Record<string, string>;
  resiliency: Partial<ResiliencyOptions>;
  validateStatus: (status: number) => boolean;
};

export class HttpClient {
  config: HttpClientConfig;

  static logger = getLogger("HttpClient");

  constructor(config: Partial<HttpClientConfig> = {}) {
    this.config = {
      validateStatus: (status) => {
        if (status > 0 && status <= 399) {
          return true;
        }
        throw new Error();
      },
      baseUrl: "",
      fallbackUrl: "",
      resiliency: {},
      headers: {},
      ...config,
    };
  }

  private async request<TData = unknown>(
    method: string,
    path: string,
    options: {
      body?: unknown;
      headers?: Record<string, string>;
    } = {},
  ): Promise<[status: number, url: string, data?: Promise<TData>]> {
    const url = "".concat(this.config.baseUrl).concat(path);
    const fallbackUrl = "".concat(this.config.fallbackUrl).concat(path);
    const payload: RequestInit = {
      method,
      headers: {
        ...this.config.headers,
        ...(options.headers || {}),
      },
    };
    if (options.body !== undefined) {
      payload.body = JSON.stringify(options.body);
      payload.headers = {
        "content-type": "application/json",
        ...payload.headers,
      };
    }

    try {
      const fallbackPolicy = fallback(handleAll, async () => {
        HttpClient.logger.info({
          policy: "fallback",
          fallbackUrl,
        });

        return fetch(url, payload).then((r) => {
          this.config.validateStatus(r.status);
          return r;
        });
      });

      const response = await wrap(
        circuitBreakerPolicy,
        bulkheadPolicy,
        fallbackPolicy,
        retryPolicy,
      ).execute(async () => {
        if (bulkheadPolicy.executionSlots === 0) {
          HttpClient.logger.warn({
            policy: "bulkhead",
            executionSlots: `${bulkheadPolicy.executionSlots}/${env.resiliency.bulkhead.size}`,
            queueSlots: `${bulkheadPolicy.queueSlots}/${env.resiliency.bulkhead.queue}`,
          });
        }

        return fetch(url, payload).then((r) => {
          this.config.validateStatus(r.status);
          return r;
        });
      });

      return [response.status, url, response.json() as Promise<TData>];
    } catch (e) {
      return [500, url]
    }
  }

  async post<TData = unknown, TBody = undefined>(
    path: string,
    body?: TBody,
  ): Promise<[status: number, url: string, data?: Promise<TData>]> {
    return this.request<TData>("post", path, { body });
  }

  async get<TData = unknown>(
    path: string,
  ): Promise<[status: number, url: string, data?: Promise<TData>]> {
    return this.request<TData>("get", path);
  }
}
