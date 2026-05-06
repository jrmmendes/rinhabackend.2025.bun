import { env } from "./env";

export const getLogger = (
  name: string,
  options?: Partial<{ disabled: boolean }>,
) => {
  const log = (
    method: "log" | "error" | "warn" | "debug",
    message: Record<string, unknown>,
  ) =>
    env.logLevel === "disabled" || options?.disabled
      ? () => undefined
      : console[method](JSON.stringify({ name, ...message }));

  return {
    info: (message: Record<string, unknown>) => log("log", message),
    error: (message: Record<string, unknown>) => log("error", message),
    warn: (message: Record<string, unknown>) => log("warn", message),
    debug: (message: Record<string, unknown>) => log("debug", message),
  };
};
