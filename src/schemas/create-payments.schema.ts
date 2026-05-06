import { Type, type Static } from '@sinclair/typebox';

export const CreatePaymentsInputSchema = Type.Object({
  correlationId: Type.String(),
  amount: Type.Number(),
});

export type CreatePaymentsInputSchema = Static<typeof CreatePaymentsInputSchema>;
