// SPDX-License-Identifier: MPL-2.0

import type { z } from 'zod';
import {
  BaseQuerySchema,
  EthscriptionBaseSchema,
  IdSchema,
} from '../schemas/index.ts';

// Input schema for getEthscriptionById procedure
export const GetEthscriptionByIdInputSchema = BaseQuerySchema.extend({
  id: IdSchema,
});

// Output schema - single EthscriptionBase
export const GetEthscriptionByIdOutputSchema = EthscriptionBaseSchema;

// Types for convenience
export type GetEthscriptionByIdInput = z.infer<
  typeof GetEthscriptionByIdInputSchema
>;
export type GetEthscriptionByIdOutput = z.infer<
  typeof GetEthscriptionByIdOutputSchema
>;
