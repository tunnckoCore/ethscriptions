// SPDX-License-Identifier: MPL-2.0

import { ORPCError, os } from '@orpc/server';
// Import original utilities until they are converted
import { getEthscriptionDetailed } from '../../../src/index.ts';
import {
  GetEthscriptionDetailedInputSchema,
  type GetEthscriptionDetailedOutput,
  GetEthscriptionDetailedOutputSchema,
} from '../schemas/ethscription-detailed.ts';

export const getEthscriptionDetailedProcedure = os
  .input(GetEthscriptionDetailedInputSchema)
  .output(GetEthscriptionDetailedOutputSchema)
  .handler(async ({ input }) => {
    const result = await getEthscriptionDetailed(input.id, input.mode, input);

    if (!result.ok) {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message:
          result.error?.message || 'Failed to fetch detailed ethscription',
        status: result.error?.httpStatus || 500,
      });
    }

    return result.result as GetEthscriptionDetailedOutput;
  });
