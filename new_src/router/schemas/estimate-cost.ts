// SPDX-License-Identifier: MPL-2.0

import { z } from 'zod';
import {
  BooleanSchema,
  DataInputSchema,
  EstimateCostResultSchema,
  SpeedSchema,
} from '../schemas/index.ts';

// Input schema for estimateDataCost procedure
export const EstimateDataCostInputSchema = z.object({
  input: DataInputSchema,
  speed: SpeedSchema.default('normal'),
  usePrices: BooleanSchema.default(true),
  bufferFee: z.number().default(0),
});

// Output schema - EstimateCostResult
export const EstimateDataCostOutputSchema = EstimateCostResultSchema;

// Types for convenience
export type EstimateDataCostInput = z.infer<typeof EstimateDataCostInputSchema>;
export type EstimateDataCostOutput = z.infer<
  typeof EstimateDataCostOutputSchema
>;
