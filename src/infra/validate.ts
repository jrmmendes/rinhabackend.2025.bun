import type { Static, TSchema } from "@sinclair/typebox";
import { Parse } from "@sinclair/typebox/value";
import { getLogger } from "./logger";

export function validate<T extends TSchema>(
  raw: unknown,
  schema: T,
): [value: Static<T> | undefined, error: unknown | undefined] {
  const logger = getLogger('validator');
  try {
    const parsed = Parse(schema, raw);
    return [parsed, undefined];
  } catch (error) {
    logger.error({ error })
    return [undefined, error];
  }
}
