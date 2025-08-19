// SPDX-License-Identifier: MPL-2.0

import { ORPCError, os } from '@orpc/server';
// Import original utilities until they are converted
import { getAllEthscriptions } from '../../../src/index.ts';
import { isEthereumAddress } from '../../../src/utils.ts';
import {
  GetUserOwnedEthscritionsInputSchema,
  GetUserOwnedEthscritionsOutputSchema,
} from '../schemas/user-owned.ts';

export const getUserOwnedEthscriptionsProcedure = os
  .input(GetUserOwnedEthscritionsInputSchema)
  .output(GetUserOwnedEthscritionsOutputSchema)
  .handler(async ({ input }) => {
    const result = await getAllEthscriptions({
      ...input,
      resolve: !isEthereumAddress(input.user),
      creator: input.user,
      current_owner: input.user,
      fromOwned: true,
    });

    if (!result.ok) {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message:
          result.error?.message || 'Failed to fetch user owned ethscriptions',
        status: result.error?.httpStatus || 500,
      });
    }
    return result.result;
  });
