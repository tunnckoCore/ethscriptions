// SPDX-License-Identifier: MPL-2.0

import { ORPCError } from '@orpc/server';
import { normalizeResult, upstreamFetcher } from '../../src/utils.ts';
import { os } from '../contract-os.ts';

export const findEthscriptionsProcedure = os.findEthscriptions.handler(
  // biome-ignore lint/correctness/noUnusedFunctionParameters: bruh
  async ({ input, context }) => {
    const opts = { ...input };
    const data: any = await upstreamFetcher(opts);

    if (!data.ok) {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: data.error?.message || 'Failed to fetch from upstream API',
        status: data.error?.httpStatus || 500,
      });
    }

    if (data.result.length === 0) {
      const message = opts.fromOwned
        ? `Profile not set up: ${opts.current_owner}`
        : 'No results found';

      throw new ORPCError('NOT_FOUND', {
        message,
        status: 404,
      });
    }

    return data.result.map((x: any) => normalizeResult(x, opts));
  }
);
