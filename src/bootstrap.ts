import { CacheClient } from "./infra/cache";
import { env } from "./infra/env";
import { HttpClient } from "./infra/http-client";
import { validate } from "./infra/validate";
import {
  createPaymentsHandler,
  createPaymentsSummaryQueryHandler,
} from "./routes/payments.route";
import { CreatePaymentsInputSchema } from "./schemas/create-payments.schema";

export const bootstrap = () => {
  const cacheClient = new CacheClient();

  const httpClient = new HttpClient({
    baseUrl: env.paymentsServiceUrl.default,
    fallbackUrl: env.paymentsServiceUrl.fallback,
  });

  return {
    listen: () => {
      console.log("> starting Bun http server");
      const server = Bun.serve({
        hostname: "0.0.0.0",
        port: env.port,
        routes: {
          "/payments-summary": {
            GET: async (req: Bun.BunRequest) => {
              const { searchParams } = new URL(req.url)
              console.log({ searchParams })
              return createPaymentsSummaryQueryHandler({ cache: cacheClient })({
                from: searchParams.get('from'),
                to: searchParams.get('to')
              })
            },
          },
          "/payments": {
            DELETE: async () => {
              cacheClient.removeAll("*");
              return new Response("OK", { status: 200 });
            },
            POST: async (req: Bun.BunRequest) => {
              const payload = await req.json();
              const [input] = validate(payload, CreatePaymentsInputSchema);
              if (!input) {
                return new Response("Bad request", { status: 400 });
              }
              return createPaymentsHandler({
                http: httpClient,
                cache: cacheClient,
              })(input);
            },
          },
        },
      });

      console.log(
        "> server running at http://%s:%s",
        server.hostname,
        server.port,
      );
      return server;
    },
  };
};
