// SPDX-License-Identifier: MPL-2.0

import { ORPCError, os } from '@orpc/server';
// Import original utilities until they are converted
import { getAllEthscriptions } from '../../../src/index.ts';
import {
  GetAllEthscritionsInputSchema,
  GetAllEthscritionsOutputSchema,
} from '../schemas/all-ethscriptions.ts';

export const getAllEthscriptionsProcedure = os
  .input(GetAllEthscritionsInputSchema)
  .output(GetAllEthscritionsOutputSchema)
  .handler(async ({ input }) => {
    const result = await getAllEthscriptions(input);

    if (!result.ok) {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: result.error?.message || 'Failed to fetch ethscriptions',
        status: result.error?.httpStatus || 500,
      });
    }

    return result.result;
  });
