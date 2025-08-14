import type {
  ENUM_ALL_DETAILED,
  ENUM_ATTACHMENT,
  ENUM_CONTENT,
  ENUM_METADATA,
  ENUM_NUMBERS,
  ENUM_OWNER,
  ENUM_SPEEDS,
  ENUM_TRANSFER,
  MEDIA_TYPES,
} from './const.ts';

export type EnumMediaType = (typeof MEDIA_TYPES)[number];

export type EthscriptionBase = {
  block_number: `${number}`;
  block_blockhash: `0x${string}`;
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
  media_type: EnumMediaType;
  media_subtype: string;
  content_type: `${EnumMediaType}/${string}`;
  content_sha: `0x${string}`;
  content_path: `/ethscriptions/${string}/content`;
  owners_path: `/ethscriptions/${string}/owners`;
  numbers_path: `/ethscriptions/${string}/numbers`;
  transfers_path: `/ethscriptions/${string}/transfers`;
  is_esip0: boolean;
  is_esip3: boolean;
  is_esip4: boolean;
  is_esip6: boolean;
  is_esip8: boolean;
};

export type EthscriptionTransfer = {
  transaction_hash: `0x${string}`;
  from_address: `0x${string}`;
  to_address: `0x${string}`;
  block_number: `${number}`;
  block_timestamp: `${number}`;
  block_blockhash: `0x${string}`;
  event_log_index: `${number}` | null;
  transaction_index: `${number}`;
  enforced_previous_owner: any | `0x${string}`;
  is_esip0: boolean;
  is_esip1: boolean;
  is_esip2: boolean;
};

export type CheckExistResult = {
  [sha: `0x${string}`]: `0x${string}` | Partial<EthscriptionBase>;
};

export type ResolveUserResult = {
  name: string;
  address: `0x${string}`;
};

export type UserProfileResult = {
  latest: EthscriptionBase;
  previous: EthscriptionBase[];
};

export type DigestResult = {
  sha: `0x${string}`;
  hex: `0x${string}`;
  input: string;
};

export type DigestResultWithCheck = {
  sha: string;
  hex: `0x${string}`;
  input: string;
  exists: CheckExistResult;
};

export type OwnersResult = {
  latest_transfer_timestamp: `${number}`;
  latest_transfer_datetime: string;
  latest_transfer_block: `${number}`;
  creator: `0x${string}`;
  initial: `0x${string}`;
  current: `0x${string}`;
  previous: `0x${string}`;
};

export type NumbersResult = {
  block_timestamp: `${number}`;
  block_datetime: string;
  block_blockhash: `0x${string}`;
  block_number: `${number}`;
  block_number_fmt: string;
  transaction_index: `${number}`;
  event_log_index: `${number}` | null;
  ethscription_number: `${number}` | null;
  ethscription_number_fmt: string;
  transfers_count: `${number}`;
};

export type PricesResult = {
  block_number: number;
  base_fee: number;
  next_fee: number;
  eth_price: string;
  gas_price: number;
  gas_fee: number;
  priority_fee: number;
};

export type BaseCostOpts = {
  speed: 'slow' | 'normal' | 'fast';
  usePrices: boolean;
  bufferFee: number;
};

export type EsimtateCostOptions =
  | BaseCostOpts
  | (PricesResult & BaseCostOpts)
  | (Partial<PricesResult> & BaseCostOpts);

export type EstimateCostResult = {
  prices: PricesResult & BaseCostOpts;
  cost: { wei: number; eth: number; usd: number };
  meta: { gasNeeded: number; inputLength: number };
};

export type PaginationType = {
  has_more: boolean;
  page_key: `0x${string}`;
  page_size?: number;
};

export type OkShape<T> = {
  ok: true;
  result: T;
  headers?: Headers | Record<string, string>;
  pagination?: PaginationType;
};

export type NotOkShape = {
  ok: false;
  error: {
    code?: string;
    message: string;
    httpStatus?: number;
    cause?: unknown;
  };
};

/**
 * from trpc core
 *
 * JSON-RPC 2.0 Error codes
 *
 * `-32000` to `-32099` are reserved for implementation-defined server-errors.
 * For tRPC we're copying the last digits of HTTP 4XX errors.
 */
// export const TRPC_ERROR_CODES_BY_KEY = {
// 	/**
// 	 * Invalid JSON was received by the server.
// 	 * An error occurred on the server while parsing the JSON text.
// 	 */
// 	PARSE_ERROR: -32_700,
// 	/**
// 	 * The JSON sent is not a valid Request object.
// 	 */
// 	BAD_REQUEST: -32_600, // 400
// 	// Internal JSON-RPC error
// 	INTERNAL_SERVER_ERROR: -32_603, // 500
// 	NOT_IMPLEMENTED: -32_603, // 501
// 	BAD_GATEWAY: -32_603, // 502
// 	SERVICE_UNAVAILABLE: -32_603, // 503
// 	GATEWAY_TIMEOUT: -32_603, // 504
// 	// Implementation specific errors
// 	UNAUTHORIZED: -32_001, // 401
// 	FORBIDDEN: -32_003, // 403
// 	NOT_FOUND: -32_004, // 404
// 	METHOD_NOT_SUPPORTED: -32_005, // 405
// 	TIMEOUT: -32_008, // 408
// 	CONFLICT: -32_009, // 409
// 	PRECONDITION_FAILED: -32_012, // 412
// 	PAYLOAD_TOO_LARGE: -32_013, // 413
// 	UNSUPPORTED_MEDIA_TYPE: -32_015, // 415
// 	UNPROCESSABLE_CONTENT: -32_022, // 422
// 	TOO_MANY_REQUESTS: -32_029, // 429
// 	CLIENT_CLOSED_REQUEST: -32_099, // 499
// } as const;

export type EnumSpeeds = (typeof ENUM_SPEEDS)[number];
export type EnumMetadata = (typeof ENUM_METADATA)[number];
export type EnumContent = (typeof ENUM_CONTENT)[number];
export type EnumOwner = (typeof ENUM_OWNER)[number];
export type EnumNumbers = (typeof ENUM_NUMBERS)[number];
export type EnumTransfer = (typeof ENUM_TRANSFER)[number];
export type EnumAttachment = (typeof ENUM_ATTACHMENT)[number];
export type EnumAllDetailed = (typeof ENUM_ALL_DETAILED)[number];

export type DetailedMap<T extends EnumAllDetailed> = {
  meta: EthscriptionBase;
  metadata: EthscriptionBase;

  data: Uint8Array;
  content: Uint8Array;

  owner: OwnersResult;
  owners: OwnersResult;
  initial: OwnersResult;
  previous: OwnersResult;
  creator: OwnersResult;
  receiver: OwnersResult;

  number: NumbersResult;
  numbers: NumbersResult;
  info: NumbersResult;
  index: NumbersResult;
  stats: NumbersResult;

  transfer: EthscriptionTransfer[];
  transfers: EthscriptionTransfer[];

  attach: Uint8Array;
  attachment: Uint8Array;
  blob: Uint8Array;
}[T];

export type ResultDetailed<T extends EnumAllDetailed> =
  | OkShape<DetailedMap<T>>
  | NotOkShape;
export type Result<T> = OkShape<T> | NotOkShape;
