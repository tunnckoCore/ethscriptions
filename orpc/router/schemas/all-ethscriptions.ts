// SPDX-License-Identifier: MPL-2.0

import { z } from 'zod';
import {
  BaseQuerySchema,
  ContentTypeSchema,
  EthereumAddressSchema,
  EthscriptionBaseSchema,
  HashSchema,
  HashWithPrefixSchema,
  MediaTypeSchema,
  NumberLikeSchema,
} from '../schemas/index.ts';

// Input schema for getAllEthscriptions procedure with comprehensive filtering
export const GetAllEthscritionsInputSchema = BaseQuerySchema.extend({
  // Pagination
  per_page: NumberLikeSchema,
  max_results: NumberLikeSchema,
  cursor: HashSchema,

  // Owner filters
  creator: EthereumAddressSchema.or(z.string().min(1)),
  current_owner: EthereumAddressSchema.or(z.string().min(1)),
  owner: EthereumAddressSchema.or(z.string().min(1)),
  initial_owner: EthereumAddressSchema.or(z.string().min(1)),
  previous_owner: EthereumAddressSchema.or(z.string().min(1)),
  receiver: EthereumAddressSchema.or(z.string().min(1)),
  initial: EthereumAddressSchema.or(z.string().min(1)),
  previous: EthereumAddressSchema.or(z.string().min(1)),
  current: EthereumAddressSchema.or(z.string().min(1)),

  // Content filters
  media_type: MediaTypeSchema,
  media_subtype: z.string(),
  mime_subtype: z.string(),
  content_type: ContentTypeSchema,
  mimetype: ContentTypeSchema,

  // Block filters
  block_number: NumberLikeSchema,
  block_hash: HashWithPrefixSchema,
  min_block_number: NumberLikeSchema,
  max_block_number: NumberLikeSchema,
  after_block: NumberLikeSchema,
  before_block: NumberLikeSchema,

  // Transaction filters
  transaction_hash: HashWithPrefixSchema,
  transaction_index: NumberLikeSchema,

  // Content hash filter
  content_sha: HashSchema,
})
  .loose()
  .partial();

// Output schema - array of EthscriptionBase
// Using .partial() the `with` and `only` filters could mess with output validation
export const GetAllEthscritionsOutputSchema = z.array(
  EthscriptionBaseSchema.partial()
);

// Types for convenience
export type GetAllEthscritionsInput = z.infer<
  typeof GetAllEthscritionsInputSchema
>;
export type GetAllEthscritionsOutput = z.infer<
  typeof GetAllEthscritionsOutputSchema
>;
