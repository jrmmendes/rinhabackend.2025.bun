import { Type, type Static } from '@sinclair/typebox';

export const GetPaymentsSummaryQuerySchema = Type.Object({
  from: Type.String(),
  to: Type.String()
});

export type GetPaymentsSummaryQuerySchema = Static<typeof GetPaymentsSummaryQuerySchema>;
