// SPDX-License-Identifier: MPL-2.0

import { ORPCError, os } from '@orpc/server';
// Import original utilities until they are converted
import { estimateDataCost } from '../../../src/index.ts';
import {
  EstimateDataCostInputSchema,
  type EstimateDataCostOutput,
  EstimateDataCostOutputSchema,
} from '../schemas/estimate-cost.ts';

export const estimateDataCostProcedure = os
  .input(EstimateDataCostInputSchema)
  .output(EstimateDataCostOutputSchema)
  .handler(async ({ input }) => {
    const { input: data, ...options } = input;

    const result = await estimateDataCost(data, options);

    if (!result.ok) {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: result.error?.message || 'Failed to estimate data cost',
        status: result.error?.httpStatus || 500,
      });
    }

    return result.result as unknown as EstimateDataCostOutput;
  });
