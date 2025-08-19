// SPDX-License-Identifier: MPL-2.0

import { ORPCError, os } from '@orpc/server';
// Import original utilities until they are converted
import { getEthscriptionDetailed } from '../../../src/index.ts';
import {
  GetEthscriptionByIdInputSchema,
  GetEthscriptionByIdOutputSchema,
} from '../schemas/ethscription-by-id.ts';

export const getEthscriptionByIdProcedure = os
  .input(GetEthscriptionByIdInputSchema)
  .output(GetEthscriptionByIdOutputSchema)
  .handler(async ({ input }) => {
    const result = await getEthscriptionDetailed(input.id, 'meta', input);

    if (!result.ok) {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: result.error?.message || 'Failed to fetch ethscription by id',
        status: result.error?.httpStatus || 500,
      });
    }

    return result.result;
  });
