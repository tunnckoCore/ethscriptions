// SPDX-License-Identifier: MPL-2.0

import { ORPCError, os } from '@orpc/server';
// Import original utilities until they are converted
import { isEthereumAddress, namesResolver } from '../../../src/utils.ts';
import {
  ResolveUserInputSchema,
  ResolveUserOutputSchema,
} from '../schemas/resolve-user.ts';

export const resolveUserProcedure = os
  .input(ResolveUserInputSchema)
  .output(ResolveUserOutputSchema)
  .handler(async ({ input }) => {
    const resolveName = isEthereumAddress(input.user);

    let resolved: any;

    try {
      resolved = await namesResolver(input.user, null, {
        baseURL: input.baseURL,
        resolveName,
        checkCreator: input.checkCreator,
      });
    } catch (error: any) {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: `Error resolving user: ${error?.message || 'Unknown error'}`,
        status: 500,
        cause: error,
      });
    }

    if (!resolved) {
      throw new ORPCError('NOT_FOUND', {
        message: `Cannot resolve ${input.user}`,
        status: 404,
      });
    }

    // Return the appropriate result based on whether we resolved a name or address
    return resolveName
      ? { name: resolved as string, address: input.user as `0x${string}` }
      : { name: input.user as string, address: resolved as `0x${string}` };
  });
