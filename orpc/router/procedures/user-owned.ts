// SPDX-License-Identifier: MPL-2.0

import { os, safe } from '@orpc/server';
import z from 'zod';
import { isEthereumAddress } from '../../../src/utils.ts';
import {
  GetAllEthscritionsInputSchema,
  type GetAllEthscritionsOutput,
  GetAllEthscritionsOutputSchema,
} from '../schemas/all-ethscriptions.ts';
import { EthereumAddressSchema } from '../schemas/index.ts';
import { getAllEthscriptionsProcedure } from './all-ethscriptions.ts';

export const getUserOwnedEthscriptionsProcedure = os
  .input(
    GetAllEthscritionsInputSchema.extend({
      user: EthereumAddressSchema.or(z.string().min(1)),
    })
  )
  .output(GetAllEthscritionsOutputSchema)
  .handler(async ({ input }) => {
    const getAllResult = await safe(
      getAllEthscriptionsProcedure.callable()({
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
  });
