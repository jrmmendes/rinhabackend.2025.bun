import { env } from "../infra/env";
import { HttpClient } from "../infra/http-client";
import type { CreatePaymentsInputSchema } from "../schemas/create-payments.schema";

export async function create(input: CreatePaymentsInputSchema) {
  const client = new HttpClient({
    baseUrl: env.paymentsServiceUrl.default,
  });

  const [status, data] = await client.post("/payments", input);

  if (status !== 200) {
    console.warn("HttpClient > Invalid response code (%s) %s", status, data);
    return new Response("Error", { status });
  }
  return new Response("Created", { status });
}
