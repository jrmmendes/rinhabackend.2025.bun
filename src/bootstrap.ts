import { env } from "./infra/env";
import { HttpClient } from "./infra/http-client";
import { validate } from "./infra/validate";
import { createPaymentsHandler } from "./routes/payments.route";
import { CreatePaymentsInputSchema } from "./schemas/create-payments.schema";

export const bootstrap = () => {
  const httpClient = new HttpClient({
    baseUrl: env.paymentsServiceUrl.default,
  });

  httpClient.isHealth("/payments");
  setInterval(() => httpClient.isHealth("/payments"), 5 * 1000);

  return {
    listen: () => {
      console.log("> starting Bun http server");
      const server = Bun.serve({
        port: env.port,
        routes: {
          "/payments": {
            POST: async (req: Bun.BunRequest) => {
              const payload = await req.json();
              const [input] = validate(payload, CreatePaymentsInputSchema);
              if (!input) {
                return new Response("Bad request", { status: 400 });
              }
              return createPaymentsHandler({ client: httpClient })(input);
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
