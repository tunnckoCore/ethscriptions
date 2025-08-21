// SPDX-License-Identifier: MPL-2.0

import { safe } from '@orpc/server';
import { os } from '../contract-os.ts';
import type { GetEthscriptionByIdOutput } from '../schemas/ethscription-by-id.ts';
import { getEthscriptionDetailedProcedure } from './ethscription-detailed.ts';

export const getEthscriptionByIdProcedure = os.getById.handler(
  async ({ input, context }) => {
    const detailedResult = await safe(
      getEthscriptionDetailedProcedure.callable({ context })({
        ...input,
        mode: 'meta',
      })
    );

    if (detailedResult.error) {
      throw detailedResult.error;
    }

    return detailedResult.data as GetEthscriptionByIdOutput;
  }
);
