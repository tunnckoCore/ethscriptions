// SPDX-License-Identifier: MPL-2.0

import { z } from 'zod';
import {
  BaseQuerySchema,
  EthereumAddressSchema,
  EthscriptionBaseSchema,
} from '../schemas/index.ts';

// Input schema for getUserCreatedEthscritions procedure
export const GetUserCreatedEthscritionsInputSchema = BaseQuerySchema.extend({
  user: EthereumAddressSchema.or(z.string().min(1)),
});

// Output schema - array of EthscriptionBase
export const GetUserCreatedEthscritionsOutputSchema = z.array(
  EthscriptionBaseSchema
);

// Types for convenience
export type GetUserCreatedEthscritionsInput = z.infer<
  typeof GetUserCreatedEthscritionsInputSchema
>;
export type GetUserCreatedEthscritionsOutput = z.infer<
  typeof GetUserCreatedEthscritionsOutputSchema
>;
