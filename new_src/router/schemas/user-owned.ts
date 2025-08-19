// SPDX-License-Identifier: MPL-2.0

import { z } from 'zod';
import {
  BaseQuerySchema,
  EthereumAddressSchema,
  EthscriptionBaseSchema,
} from '../schemas/index.ts';

// Input schema for getUserOwnedEthscriptions procedure
export const GetUserOwnedEthscritionsInputSchema = BaseQuerySchema.extend({
  user: EthereumAddressSchema.or(z.string().min(1)),
});

// Output schema - array of EthscriptionBase
export const GetUserOwnedEthscritionsOutputSchema = z.array(
  EthscriptionBaseSchema
);

// Types for convenience
export type GetUserOwnedEthscritionsInput = z.infer<
  typeof GetUserOwnedEthscritionsInputSchema
>;
export type GetUserOwnedEthscritionsOutput = z.infer<
  typeof GetUserOwnedEthscritionsOutputSchema
>;
