import type { CacheClient } from "../infra/cache";
import { env } from "../infra/env";
import { HttpClient } from "../infra/http-client";
import type { CreatePaymentsInputSchema } from "../schemas/create-payments.schema";

export const createPaymentsHandler =
  ({ http, cache }: { http: HttpClient; cache: CacheClient }) =>
  async (input: CreatePaymentsInputSchema) => {
    http.post("/payments", input).then(([status, url]) => {
      if (status === 200) {
        const providerName = {
          [env.paymentsServiceUrl.default]: "default",
          [env.paymentsServiceUrl.fallback]: "fallback",
        }[url.split("payments")?.[0]?.slice(0, -1) ?? ""];

        cache.set(
          `${providerName}:${Date.now()}:${input.correlationId}`,
          input.amount,
        );
      }
    });
    return new Response("OK", { status: 200 });
  };

export const createPaymentsSummaryQueryHandler =
  ({ cache }: { cache: CacheClient }) =>
  async (filters?: Partial<{ from: string; to: string }>) => {
    const from = filters?.from ? new Date(filters.from).getTime() : undefined;
    const to = filters?.to ? new Date(filters.to).getTime() : undefined;

    const defaultPayments = await cache.getAll("default:*", {from, to});
    const defaultTotalAmount = defaultPayments.reduce(
      (acc, cur) => acc + Number(cur),
      0,
    );

    const fallbackPayments = await cache.getAll("fallback:*", { from, to});
    const fallbackTotalAmount = fallbackPayments.reduce(
      (acc, cur) => acc + Number(cur),
      0,
    );

    return new Response(
      JSON.stringify({
        default: {
          totalRequests: defaultPayments.length,
          totalAmount: defaultTotalAmount,
        },
        fallback: {
          totalRequests: fallbackPayments.length,
          totalAmount: fallbackTotalAmount,
        },
      }),
      { status: 200 },
    );
  };
