import { z } from 'zod';

export const booleanSchema = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true');

export const numberPositiveSchema = z
  .string()
  .transform(Number)
  .pipe(z.number().int().positive());
export const numberSchema = z.string().transform(Number).pipe(z.number().int());

// Helper for address-like strings (0x... or ENS)
export const addressSchema = z.string().regex(/^(0x[\dA-Fa-f]{40}|.*\.eth)$/);

export const hexSchema = z.custom(
  (x) =>
    x &&
    typeof x === 'string' &&
    x.length > 0 &&
    /^[\da-f]+$/i.test(x.replace('0x', '')) &&
    x.length % 2 === 0,
  { message: 'Expected a valid hex string' }
);

export const txHashSchema = z
  .string()
  .length(66)
  .regex(/^0x[\dA-Fa-f]{64}$/, {
    message: 'Invalid hex format. Must be a hex string',
  });

export const notHexSchema = z.custom(
  (x) =>
    x &&
    typeof x === 'string' &&
    x.length > 0 &&
    !/^[\da-f]+$/i.test(x.replace('0x', '')),
  { message: 'Expected a not-hex string, received hex' }
);

export const shaSchema = hexSchema
  .and(z.string().length(64))
  .or(txHashSchema.transform((x) => x.replace('0x', '')));

export type BaseEthsType = {
  block_number: `${number}`;
  block_blockhash: string;
  block_timestamp: `${number}`;
  block_datetime: string;
  event_log_index: `${number}` | null;
  transaction_hash: `0x${string}`;
  transaction_index: `${number}`;
  transaction_value: `${number}`;
  transaction_fee: `${number}`;
  gas_price: `${number}`;
  gas_used: `${number}`;
  creator: `0x${string}`;
  receiver: `0x${string}`;
  media_type: string;
  media_subtype: string;
  content_type: `${string}/${string}`;
  content_sha: string;
  content_path: `/ethscriptions/${string}`;
  is_esip0: boolean;
  is_esip3: boolean;
  is_esip4: boolean;
  is_esip6: boolean;
  is_esip8: boolean;
};

export const baseEthscriptionSchema = z.object({
  // event_log_index: z.string().nullable(),
  transaction_hash: txHashSchema,
  transaction_index: numberSchema,
  transaction_value: numberSchema,
  transaction_fee: numberSchema,

  block_number: numberSchema,
  block_blockhash: txHashSchema,
  block_timestamp: numberSchema,
  block_datetime: z.string().datetime(),

  gas_price: numberSchema,
  gas_used: numberSchema,
  creator: addressSchema,
  receiver: addressSchema,
  media_type: z.string(),
  media_subtype: z.string(),
  content_type: z
    .string()
    .regex(/^.+\/.+$/, {
      message: 'Invalid Content Type format, must be like "image/png"',
    }),
  content_sha: shaSchema,
  content_path: z.string().regex(/^\/ethscriptions\/.+/),
  is_esip0: z.boolean(),
  is_esip3: z.boolean(),
  is_esip4: z.boolean(),
  is_esip6: z.boolean(),
  is_esip8: z.boolean(),
});

export const dataURISchema = z
  .string()
  .min(6)
  .max(20)
  .startsWith('data:')
  .or(hexSchema.and(z.string().startsWith('0x646174613a')));

export const userSchema = hexSchema
  .and(z.string().length(42))
  .or(z.string().min(1));
