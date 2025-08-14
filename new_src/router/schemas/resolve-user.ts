// SPDX-License-Identifier: MPL-2.0

import { z } from 'zod';
import {
  BaseQuerySchema,
  BooleanSchema,
  EthereumAddressSchema,
  ResolveUserResultSchema,
} from '../schemas/index.ts';

// Input schema for resolveUser procedure
export const ResolveUserInputSchema = BaseQuerySchema.extend({
  user: EthereumAddressSchema.or(z.string().min(1)),
  checkCreator: BooleanSchema.default(false),
});

// Output schema (reuse existing)
export const ResolveUserOutputSchema = ResolveUserResultSchema;

// Types for convenience
export type ResolveUserInput = z.infer<typeof ResolveUserInputSchema>;
export type ResolveUserOutput = z.infer<typeof ResolveUserOutputSchema>;
