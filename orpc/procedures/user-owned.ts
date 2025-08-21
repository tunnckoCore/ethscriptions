// SPDX-License-Identifier: MPL-2.0

import { safe } from '@orpc/server';
import { isEthereumAddress } from '../../src/utils.ts';
import { os } from '../contract-os.ts';
import type { GetAllEthscritionsOutput } from '../schemas/all-ethscriptions.ts';
import { findEthscriptionsProcedure } from './find-ethscriptions.ts';

export const getUserOwnedEthscriptionsProcedure = os.users.getOwned.handler(
  async ({ input, context }) => {
    const getAllResult = await safe(
      findEthscriptionsProcedure.callable({ context })({
        ...input,
        resolve: !isEthereumAddress(input.user),
        current_owner: input.user,
        fromOwned: true,
      })
    );

    if (getAllResult.error) {
      throw getAllResult.error;
    }

    return getAllResult.data as GetAllEthscritionsOutput;
  }
);
