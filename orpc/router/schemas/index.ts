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

export const NumericStringSchema = z
  .string()
  .regex(/^\d+$/, 'Must be a numeric string');

export const NumberSchema = z
  .string()
  .regex(/^\d+$/, 'Must be a numeric string')
  .transform(Number)
  .pipe(PositiveNumberSchema);

export const NumberLikeSchema = PositiveNumberSchema.or(NumberSchema);
export const BigIntLikeSchema = z
  .string()
  .transform(BigInt)
  .pipe(z.bigint().gte(0n));

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
  'font',
  'image',
  'text',
  'video',
  'audio',
  'application',
]);
export const ContentTypeSchema = z
  .string()
  .regex(/^(font|image|text|video|audio|application|message)\/.+$/, {
    message: 'Invalid Content Type format, must be like "image/png"',
  });

// block_number: 18162935,
// block_hash: "0x9d4e214cd06998f91f8c13f372302050029cdb5e67dfeb6514f996603ce0b3d9",
// block_timestamp: 1695041507,
// block_datetime: "2023-09-18T12:51:47.000Z",
// transaction_hash: "0x02fd6cd9df507b917e644bc8d23082f7548fdca683c91f058abd5a6fe896facb",
// transaction_index: 94,
// transaction_value: 0,
// transaction_fee: 461441903696920,
// gas_price: 14474338259,
// gas_used: 31880,
// creator: "0xa20c07f94a127fd76e61fbea1019cce759225002",
// receiver: "0x0000000000000000000000000000000000000000",
// media_type: "application",
// media_subtype: "vnd.esc.user.profile+json",
// content_type: "application/vnd.esc.user.profile+json",
// content_sha: "0x0472c07618add66690675704af1fe2e547451a0721b1ec73ff1c53ccb7a81aee",
// content_path: "/ethscriptions/0x02fd6cd9df507b917e644bc8d23082f7548fdca683c91f058abd5a6fe896facb/content",
// owners_path: "/ethscriptions/0x02fd6cd9df507b917e644bc8d23082f7548fdca683c91f058abd5a6fe896facb/owners",
// numbers_path: "/ethscriptions/0x02fd6cd9df507b917e644bc8d23082f7548fdca683c91f058abd5a6fe896facb/numbers",
// transfers_path: "/ethscriptions/0x02fd6cd9df507b917e644bc8d23082f7548fdca683c91f058abd5a6fe896facb/transfers",
// is_esip0: true,
// is_esip3: false,
// is_esip4: false,
// is_esip6: false,
// is_esip8: false,
// Base ethscription schema
export const EthscriptionBaseSchema = z
  .object({
    block_number: NumberLikeSchema,
    block_hash: HashWithPrefixSchema,
    block_timestamp: NumberLikeSchema,
    block_datetime: z.iso.datetime(),

    transaction_hash: HashWithPrefixSchema,
    transaction_index: NumberLikeSchema,

    transaction_value: NumberLikeSchema.or(BigIntLikeSchema).or(
      z.bigint().gte(0n)
    ),
    transaction_fee: NumberLikeSchema.or(BigIntLikeSchema).or(
      z.bigint().gte(0n)
    ),
    gas_price: NumberLikeSchema.or(BigIntLikeSchema).or(z.bigint().gte(0n)),
    gas_used: NumberLikeSchema.or(BigIntLikeSchema).or(z.bigint().gte(0n)),

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

    ethscription_number: NumberLikeSchema.optional(),
  })
  .loose();
export type Ethscription = z.infer<typeof EthscriptionBaseSchema>;

// Ethscription transfer schema
export const EthscriptionTransferSchema = z
  .object({
    transaction_hash: HashWithPrefixSchema,
    from_address: EthereumAddressSchema,
    to_address: EthereumAddressSchema,
    block_number: NumberLikeSchema,
    block_timestamp: NumberLikeSchema,
    block_hash: HashWithPrefixSchema,
    event_log_index: NumberLikeSchema.nullable(),
    transaction_index: NumberLikeSchema.or(z.number().gte(0)),
    enforced_previous_owner: EthereumAddressSchema.nullable(),
    is_esip0: z.boolean(),
    is_esip1: z.boolean(),
    is_esip2: z.boolean(),
  })
  .loose();

// Common options schema pieces
export const BaseOptionsSchema = z.object({
  baseURL: z.url().default(BASE_API_URL),
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

export const DigestResultSchema = z
  .object({
    sha: HashWithPrefixSchema,
    hex: HexStringSchema,
    input: z.string().optional(),
  })
  .strict();

export const CheckExistResultSchema = z.record(
  HexStringSchema,
  z.union([HexStringSchema, EthscriptionBaseSchema.partial().nullable()])
);

export const OwnersResultSchema = z.object({
  latest_transfer_timestamp: NumberLikeSchema,
  latest_transfer_datetime: z.iso.datetime(),
  latest_transfer_block: NumberLikeSchema,
  creator: EthereumAddressSchema,
  initial: EthereumAddressSchema,
  current: EthereumAddressSchema,
  previous: EthereumAddressSchema,
});

export const NumbersResultSchema = z.object({
  block_timestamp: NumberLikeSchema,
  block_datetime: z.iso.datetime(),
  block_hash: HashWithPrefixSchema,
  block_number: NumberLikeSchema,
  block_number_fmt: z.string(),
  transaction_index: NumberLikeSchema,
  event_log_index: NumberLikeSchema.nullable(),
  ethscription_number: NumberLikeSchema.nullable(),
  ethscription_number_fmt: z.string(),
  transfers_count: NumberLikeSchema,
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

export const BaseQuerySchema = BaseOptionsSchema.extend(
  z
    .object({
      with: z.string(),
      only: z.string(),
      resolve: BooleanSchema,
      reverse: BooleanSchema,
      expand: BooleanSchema,
      transaction_hash_only: BooleanSchema,
      page_size: z.number().int().min(1).max(100),
      page_key: HashWithPrefixSchema,
    })
    .partial().shape
);

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
