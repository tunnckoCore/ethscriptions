// SPDX-License-Identifier: MPL-2.0

import { z } from 'zod';
import {
  BaseQuerySchema,
  EnumAllDetailedSchema,
  EthscriptionBaseSchema,
  EthscriptionTransferSchema,
  IdSchema,
  NumbersResultSchema,
  OwnersResultSchema,
} from '../schemas/index.ts';

// Input schema for getEthscriptionDetailed procedure
export const GetEthscriptionDetailedInputSchema = BaseQuerySchema.extend({
  id: IdSchema,
  mode: EnumAllDetailedSchema,
});

// Output schema - union of all possible return types based on type parameter
export const GetEthscriptionDetailedOutputSchema = z.union([
  // meta, metadata -> EthscriptionBase;
  // It already has .loose(), but we add .partial too,
  // because the `with/only` filters could mess with output schema validation
  EthscriptionBaseSchema.partial(),

  // data, content, attach, attachment, blob -> Uint8Array
  z.instanceof(Uint8Array),

  // owner, owners, initial, previous, creator, receiver -> OwnersResult
  OwnersResultSchema,

  // number, numbers, info, index, stats -> NumbersResult
  NumbersResultSchema,

  // transfer, transfers -> EthscriptionTransfer[]
  z.array(EthscriptionTransferSchema),
]);

// Types for convenience
export type GetEthscriptionDetailedInput = z.infer<
  typeof GetEthscriptionDetailedInputSchema
>;
export type GetEthscriptionDetailedOutput = z.infer<
  typeof GetEthscriptionDetailedOutputSchema
>;
