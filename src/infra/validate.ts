import type { Static, TSchema } from "@sinclair/typebox";
import { Parse } from "@sinclair/typebox/value";

export function validate<T extends TSchema>(
  raw: unknown,
  schema: T,
): [value: Static<T> | undefined, error: unknown | undefined] {
  try {
    const parsed = Parse(schema, raw);
    return [parsed, undefined];
  } catch (error) {
    console.error('Error > %s', error)
    return [undefined, error];
  }
}
