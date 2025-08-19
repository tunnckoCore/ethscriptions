// SPDX-License-Identifier: MPL-2.0

import { os, safe } from '@orpc/server';
// Import original utilities until they are converted
import {
  GetEthscriptionByIdInputSchema,
  type GetEthscriptionByIdOutput,
  GetEthscriptionByIdOutputSchema,
} from '../schemas/ethscription-by-id.ts';
import { getEthscriptionDetailedProcedure } from './ethscription-detailed.ts';

export const getEthscriptionByIdProcedure = os
  .input(GetEthscriptionByIdInputSchema)
  .output(GetEthscriptionByIdOutputSchema)
  .handler(async ({ input }) => {
    const detailedResult = await safe(
      getEthscriptionDetailedProcedure.callable()({ ...input, mode: 'meta' })
    );

    if (detailedResult.error) {
      throw detailedResult.error;
    }

    return detailedResult.data as GetEthscriptionByIdOutput;
  });
