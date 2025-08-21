// SPDX-License-Identifier: MPL-2.0

import { ORPCError } from '@orpc/server';
import { os } from '../contract-os.ts';

export const getPricesProcedure = os.utils.getPrices.handler(
  // biome-ignore lint/correctness/noUnusedFunctionParameters: bruh
  async ({ input, context }) => {
    try {
      const resp = await fetch('https://www.ethgastracker.com/api/gas/latest');

      if (!resp.ok) {
        throw new ORPCError('BAD_REQUEST', {
          message: `Failed to fetch gas prices: ${resp.statusText}`,
          status: resp.status || 500,
        });
      }

      const { data }: any = await resp.json();

      return {
        block_number: Number(data.blockNr),
        base_fee: data.baseFee,
        next_fee: data.nextFee,
        eth_price: data.ethPrice,
        gas_price: data.oracle[input].gwei,
        gas_fee: data.oracle[input].gasFee,
        priority_fee: data.oracle[input].priorityFee,
      };
    } catch (err: any) {
      // Re-throw ORPCErrors as-is
      if (err instanceof ORPCError) {
        throw err;
      }

      // Convert other errors to INTERNAL_SERVER_ERROR
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: `Failed to fetch prices API: ${err.toString()}`,
        status: 500,
      });
    }
  }
);
