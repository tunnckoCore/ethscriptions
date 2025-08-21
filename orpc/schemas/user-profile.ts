// SPDX-License-Identifier: MPL-2.0

import { z } from 'zod';
import {
  BaseQuerySchema,
  BooleanSchema,
  EthereumAddressSchema,
  UserProfileResultSchema,
} from '../schemas/index.ts';

// Input schema for getUserProfile procedure
export const GetUserProfileInputSchema = BaseQuerySchema.extend({
  user: EthereumAddressSchema.or(z.string().min(1)),
  latest: BooleanSchema.default(true),
});

// Output schema - union type for latest vs full profile
export const GetUserProfileOutputSchema = z.union([
  UserProfileResultSchema,
  UserProfileResultSchema.shape.latest, // Just the latest EthscriptionBase
]);

// Types for convenience
export type GetUserProfileInput = z.infer<typeof GetUserProfileInputSchema>;
export type GetUserProfileOutput = z.infer<typeof GetUserProfileOutputSchema>;
