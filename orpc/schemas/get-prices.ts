// SPDX-License-Identifier: MPL-2.0

import type { z } from 'zod';
import { PricesResultSchema, SpeedSchema } from './index.ts';

// Input schema for getPrices procedure
export const GetPricesInputSchema = SpeedSchema.default('normal');

// Output schema (reuse existing)
export const GetPricesOutputSchema = PricesResultSchema;

// Types for convenience
export type GetPricesInput = z.infer<typeof GetPricesInputSchema>;
export type GetPricesOutput = z.infer<typeof GetPricesOutputSchema>;
