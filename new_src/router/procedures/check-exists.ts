// SPDX-License-Identifier: MPL-2.0

import { ORPCError, os } from '@orpc/server';
// Import original function for expand functionality until getEthscriptionDetailed is converted
import { getEthscriptionDetailed } from '../../../src/index.ts';
import {
  MultiCheckExistsInputSchema,
  MultiCheckExistsOutputSchema,
} from '../schemas/check-exists.ts';

export const multiCheckExistsProcedure = os
  .input(MultiCheckExistsInputSchema)
  .output(MultiCheckExistsOutputSchema)
  .handler(async ({ input }) => {
    // Process shas into normalized hash list
    const shaList = (typeof input.shas === 'string' ? [input.shas] : input.shas)
      .filter(Boolean)
      .flatMap((x) =>
        x
          .replace('0x', '')
          .match(/[0-9a-fA-F]{64}/g)
          ?.map((z: string) => z?.replace('0x', ''))
      )
      .filter(Boolean);

    if (shaList.length === 0) {
      throw new ORPCError('BAD_REQUEST', {
        message: 'No valid SHA-256 hashes provided',
        status: 400,
      });
    }

    if (shaList.length > 100) {
      throw new ORPCError('BAD_REQUEST', {
        message: 'Too many hashes provided',
        status: 400,
      });
    }

    let resp: any;
    try {
      resp = await fetch(`${input.baseURL}/ethscriptions/exists_multi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shas: shaList.map((x) => `0x${x}`) }),
      }).then((x) => x.json());
    } catch (err: any) {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Failed to fetch from upstream API',
        status: 500,
        cause: err,
      });
    }

    const hasFound =
      Object.values(resp.result || {}).filter(Boolean).length > 0;

    if (!hasFound) {
      throw new ORPCError('NOT_FOUND', {
        message: 'No ethscriptions found',
        status: 404,
      });
    }

    // Handle expansion if requested
    if (input.expand) {
      const expanded = await Promise.all(
        Object.entries(resp.result).map(async ([sha, id = '']) => {
          if (!id) {
            return [sha, null];
          }

          // TODO: Replace with call() helper once getEthscriptionDetailed is converted
          const { ok, result } = (await getEthscriptionDetailed(
            id as string,
            'meta',
            { baseURL: input.baseURL }
          )) as any;

          return [sha, ok ? result : id];
        })
      );

      return Object.fromEntries(expanded);
    }

    return resp.result;
  });
