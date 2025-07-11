import { env } from "./infra/env";
import { validate } from "./infra/validate";
import { create } from "./routes/payments.route";
import { CreatePaymentsInputSchema } from "./schemas/create-payments.schema";

export const bootstrap = () => {

  return {
    listen: () => {
      console.log("> starting Bun http server");
      const server = Bun.serve({
        port: env.port,
        routes: {
          '/payments':{
            POST: async (req: Bun.BunRequest) => {
              const payload = await req.json();
              const [input] = validate(payload, CreatePaymentsInputSchema);
              if (!input) {
                return new Response("Bad request", { status: 400 })
              }
              return create(input);
            } 
          }
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
