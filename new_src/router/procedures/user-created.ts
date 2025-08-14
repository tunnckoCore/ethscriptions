// SPDX-License-Identifier: MPL-2.0

import { ORPCError, os } from '@orpc/server';
// Import original utilities until they are converted
import { getAllEthscriptions } from '../../../src/index.ts';
import { isEthereumAddress } from '../../../src/utils.ts';
import {
  GetUserCreatedEthscritionsInputSchema,
  GetUserCreatedEthscritionsOutputSchema,
} from '../schemas/user-created.ts';

export const getUserCreatedEthscriptionsProcedure = os
  .input(GetUserCreatedEthscritionsInputSchema)
  .output(GetUserCreatedEthscritionsOutputSchema)
  .handler(async ({ input }) => {
    const result = await getAllEthscriptions({
      ...input,
      resolve: !isEthereumAddress(input.user),
      creator: input.user,
    });

    if (!result.ok) {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message:
          result.error?.message || 'Failed to fetch user created ethscriptions',
        status: result.error?.httpStatus || 500,
      });
    }
    return result.result;
  });
