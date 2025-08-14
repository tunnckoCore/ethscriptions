// SPDX-License-Identifier: MPL-2.0

import { z } from 'zod';

export const BASE_API_URL = 'https://api.ethscriptions.com/v2';

// Common validation schemas

export const BooleanSchema = z.stringbool().or(z.boolean());

export const PositiveNumberSchema = z.number().int().gte(0);

export const IdSchema = z
  .string()
  .transform((x) => x.replaceAll(',', ''))
  .pipe(
    z
      .string()
      .min(1)
      .max(66)
      .regex(/^([1-9]\d*|0x[\dA-Fa-f]{64})$/, {
        message: `Invalid "id" format. Must be a ethscription number or transaction hash`,
      })
  );

export const NumberSchema = z
  .string()
  .regex(/^\d+$/, 'Must be a numeric string')
  .transform(Number)
  .pipe(PositiveNumberSchema);

export const HexStringSchema = z.custom<string | `0x${string}`>(
  (x) =>
    x &&
    typeof x === 'string' &&
    x.length > 0 &&
    /^[\da-f]+$/i.test(x.replace('0x', '')) &&
    x.length % 2 === 0,
  { message: 'Expected a valid hex string' }
);

export const NotHexSchema = z.custom<string>(
  (x) =>
    x &&
    typeof x === 'string' &&
    x.length > 0 &&
    !/^[\da-f]+$/i.test(x.replace('0x', '')),
  { message: 'Expected a not-hex string, received hex' }
);

export const EthereumAddressSchema = z
  .string()
  .regex(/^(0x[\dA-Fa-f]{40}|.*\.eth)$/, 'Must be a valid Ethereum address');

export const HashSchema = HexStringSchema.and(z.string().min(64).max(66));

export const HashWithPrefixSchema = HexStringSchema.and(
  z.string().startsWith('0x').length(66)
);

// Media type schemas
export const MediaTypeSchema = z.enum([
  'image',
  'text',
  'video',
  'audio',
  'application',
]);
export const ContentTypeSchema = z
  .string()
  .regex(/^(image|text|video|audio|application|message)\/.+$/, {
    message: 'Invalid Content Type format, must be like "image/png"',
  });

// Base ethscription schema
export const EthscriptionBaseSchema = z.object({
  block_number: PositiveNumberSchema.or(NumberSchema),
  block_blockhash: HashWithPrefixSchema,
  block_timestamp: PositiveNumberSchema.or(NumberSchema),
  block_datetime: z.iso.datetime(),

  event_log_index: PositiveNumberSchema.or(NumberSchema).nullable(),
  transaction_hash: HashWithPrefixSchema,
  transaction_index: PositiveNumberSchema.or(NumberSchema),
  transaction_value: PositiveNumberSchema.or(NumberSchema),
  transaction_fee: PositiveNumberSchema.or(NumberSchema),
  gas_price: PositiveNumberSchema.or(NumberSchema),
  gas_used: PositiveNumberSchema.or(NumberSchema),
  creator: EthereumAddressSchema,
  receiver: EthereumAddressSchema,
  media_type: MediaTypeSchema,
  media_subtype: z.string(),
  content_type: ContentTypeSchema,
  content_sha: HashWithPrefixSchema,
  content_path: z.string().startsWith('/ethscriptions/'),
  owners_path: z.string().startsWith('/ethscriptions/'),
  numbers_path: z.string().startsWith('/ethscriptions/'),
  transfers_path: z.string().startsWith('/ethscriptions/'),
  is_esip0: z.boolean(),
  is_esip3: z.boolean(),
  is_esip4: z.boolean(),
  is_esip6: z.boolean(),
  is_esip8: z.boolean(),
});

// Ethscription transfer schema
export const EthscriptionTransferSchema = z.object({
  transaction_hash: HashWithPrefixSchema,
  from_address: EthereumAddressSchema,
  to_address: EthereumAddressSchema,
  block_number: PositiveNumberSchema.or(NumberSchema),
  block_timestamp: PositiveNumberSchema.or(NumberSchema),
  block_blockhash: HashWithPrefixSchema,
  event_log_index: PositiveNumberSchema.or(NumberSchema).nullable(),
  transaction_index: PositiveNumberSchema.or(NumberSchema),
  enforced_previous_owner: EthereumAddressSchema.nullable(),
  is_esip0: z.boolean(),
  is_esip1: z.boolean(),
  is_esip2: z.boolean(),
});

// Common options schema pieces
export const BaseOptionsSchema = z.object({
  baseURL: z.url().optional(),
});

// Speed enum for gas prices
export const SpeedSchema = z.enum(['slow', 'normal', 'fast']);

// Result schemas
export const PricesResultSchema = z.object({
  block_number: z.number(),
  base_fee: z.number(),
  next_fee: z.number(),
  eth_price: z.number(),
  gas_price: z.number(),
  gas_fee: z.number(),
  priority_fee: z.number(),
});

export const ResolveUserResultSchema = z.object({
  name: z.string().min(1),
  address: EthereumAddressSchema,
});

export const UserProfileResultSchema = z.object({
  latest: EthscriptionBaseSchema,
  previous: z.array(EthscriptionBaseSchema),
});

export const DigestResultSchema = z.object({
  sha: HashSchema.or(HashWithPrefixSchema),
  hex: HexStringSchema,
  input: z.string(),
});

export const CheckExistResultSchema = z.record(
  HexStringSchema,
  z.union([HexStringSchema, EthscriptionBaseSchema.partial()])
);

export const DigestResultWithCheckSchema = DigestResultSchema.extend({
  exists: CheckExistResultSchema,
});

export const OwnersResultSchema = z.object({
  latest_transfer_timestamp: PositiveNumberSchema.or(NumberSchema),
  latest_transfer_datetime: z.iso.datetime(),
  latest_transfer_block: PositiveNumberSchema.or(NumberSchema),
  creator: EthereumAddressSchema,
  initial: EthereumAddressSchema,
  current: EthereumAddressSchema,
  previous: EthereumAddressSchema,
});

export const NumbersResultSchema = z.object({
  block_timestamp: PositiveNumberSchema.or(NumberSchema),
  block_datetime: z.iso.datetime(),
  block_blockhash: HashWithPrefixSchema,
  block_number: PositiveNumberSchema.or(NumberSchema),
  block_number_fmt: z.string(),
  transaction_index: PositiveNumberSchema.or(NumberSchema),
  event_log_index: PositiveNumberSchema.or(NumberSchema).nullable(),
  ethscription_number: PositiveNumberSchema.or(NumberSchema).nullable(),
  ethscription_number_fmt: z.string(),
  transfers_count: PositiveNumberSchema.or(NumberSchema),
});

export const BaseCostOptsSchema = z.object({
  speed: SpeedSchema,
  usePrices: z.boolean(),
  bufferFee: z.number(),
});

export const EstimateCostResultSchema = z.object({
  prices: BaseCostOptsSchema.extend(PricesResultSchema.shape),
  cost: z.object({
    wei: z.number(),
    eth: z.number(),
    usd: z.number(),
  }),
  meta: z.object({
    gasNeeded: z.number(),
    inputLength: z.number(),
  }),
});

// Enum schemas for detailed types
export const EnumAllDetailedSchema = z.enum([
  'meta',
  'metadata',
  'data',
  'content',
  'owner',
  'owners',
  'initial',
  'previous',
  'creator',
  'receiver',
  'number',
  'numbers',
  'info',
  'index',
  'stats',
  'transfer',
  'transfers',
  'attach',
  'attachment',
  'blob',
]);

export const BaseQuerySchema = z.object({
  baseURL: z.url().default(BASE_API_URL),
  with: z.string().optional(),
  only: z.string().optional(),
  resolve: BooleanSchema.optional(),
  reverse: BooleanSchema.optional(),
  expand: BooleanSchema.optional(),
});

// Utility functions
export const createPaginationSchema = () =>
  z
    .object({
      page: z.number().int().min(1).optional(),
      per_page: z.number().int().min(1).max(100).optional(),
    })
    .optional();

// Data input validation for complex types
export const DataInputSchema = z.union([
  z
    .string()
    .min(6)
    .startsWith('data:')
    .or(HexStringSchema.and(z.string().startsWith('0x646174613a'))), // data URI

  HexStringSchema, // hex string

  z.instanceof(Uint8Array),
]);
