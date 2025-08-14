// SPDX-License-Identifier: MPL-2.0

import { z } from 'zod';
import {
  BaseQuerySchema,
  CheckExistResultSchema,
  HashSchema,
  HashWithPrefixSchema,
  HexStringSchema,
} from '../schemas/index.ts';

// Input schema for multiCheckExists procedure
export const MultiCheckExistsInputSchema = z
  .object({
    shas: HashSchema.or(HexStringSchema.and(z.string().min(120)))
      .or(HashWithPrefixSchema)
      .or(
        z.array(HashSchema.or(HexStringSchema.and(z.string().min(120)))).min(1)
      )
      .or(
        z
          .array(
            HashWithPrefixSchema.or(HexStringSchema.and(z.string().min(120)))
          )
          .min(1)
      ),
  })
  .extend(BaseQuerySchema.shape);

// Output schema (reuse existing)
export const MultiCheckExistsOutputSchema = CheckExistResultSchema;

// Types for convenience
export type MultiCheckExistsInput = z.infer<typeof MultiCheckExistsInputSchema>;
export type MultiCheckExistsOutput = z.infer<
  typeof MultiCheckExistsOutputSchema
>;
