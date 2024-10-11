export type EthscriptionBase = {
  block_number: `${number}`;
  block_blockhash: string;
  block_timestamp: `${number}`;
  block_datetime: string;
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

export type CheckExistResult = {
  exists: boolean;
  ethscription?: EthscriptionBase;
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
  sha: string;
  hex: `0x${string}`;
  input: string;
  exists?: boolean;
  ethscription?: EthscriptionBase;
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
  ethscription_number: `${number}`;
  ethscription_number_fmt: string;
  ethscription_transfers: `${number}`;
};

export type PricesResult = {
  blockNumber: string;
  baseFee: number;
  nextFee: number;
  ethPrice: string;
  gasPrice: number;
  gasFee: number;
  priorityFee: number;
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

export type OkShape<T> = {
  ok: true;
  result: T;
  headers?: Headers | Record<string, string>;
  pagination?: {
    page_key: `0x${string}`;
    has_more: boolean;
  };
};

// Define the NotOkShape
export type NotOkShape = {
  ok: false;
  error: {
    message: string;
    httpStatus: number;
  };
};

export type EnumMetadata = 'meta' | 'metadata';
export type EnumContent = 'data' | 'content';
export type EnumOwner = 'owner' | 'owners' | 'initial' | 'previous' | 'creator' | 'receiver';
export type EnumNumbers = 'number' | 'numbers' | 'info' | 'index' | 'stats';
export type EnumTransfer = 'transfer' | 'transfers';
export type EnumAttachment = 'attach' | 'attachment' | 'blob';
export type EnumAllDetailed =
  | EnumMetadata
  | EnumContent
  | EnumOwner
  | EnumNumbers
  | EnumTransfer
  | EnumAttachment;

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

export type ResultDetailed<T extends EnumAllDetailed> = OkShape<DetailedMap<T>> | NotOkShape;
export type Result<T> = OkShape<T> | NotOkShape;

// Define the function with a simplified return type
// function foobar<T extends EnumAllDetailed>(type: T): ResultDetailed<T> {
//   switch (type) {
//     case 'meta':
//     case 'metadata': {
//       return {
//         ok: true,
//         result: eth as EthscriptionBase,
//       } as OkShape<DetailedMap<T>>;
//     }

//     case 'data':
//     case 'content': {
//       return {
//         ok: true,
//         result: new Uint8Array(123),
//       } as OkShape<DetailedMap<T>>;
//     }

//     case 'owner':
//     case 'owners':
//     case 'initial':
//     case 'previous':
//     case 'creator':
//     case 'receiver': {
//       return {
//         ok: true,
//         result: {
//           latest_transfer_timestamp: '123',
//           latest_transfer_datetime: '123',
//           latest_transfer_block: '123',
//           creator: '0x123',
//           initial: '0x123',
//           current: '0x123',
//           previous: '0x123',
//         } as OwnersResult,
//       } as OkShape<DetailedMap<T>>;
//     }

//     case 'number':
//     case 'numbers':
//     case 'info':
//     case 'index':
//     case 'stats': {
//       return {
//         ok: true,
//         result: {
//           block_timestamp: '123',
//           block_datetime: '123',
//           block_blockhash: '0x123',
//           block_number: '123',
//           block_number_fmt: '123',
//           transaction_index: '123',
//           event_log_index: '123',
//           ethscription_number: '123',
//           ethscription_number_fmt: '123',
//           ethscription_transfers: '123',
//         } as NumbersResult,
//       } as OkShape<DetailedMap<T>>;
//     }

//     case 'transfer':
//     case 'transfers': {
//       return {
//         ok: true,
//         result: [
//           {
//             transaction_hash: '0x123',
//             from_address: '0x123',
//             to_address: '0x123',
//             block_number: '123',
//             block_timestamp: '123',
//             block_blockhash: '0x123',
//             event_log_index: '123',
//             transaction_index: '123',
//             enforced_previous_owner: '0x123',
//             is_esip0: true,
//             is_esip1: true,
//             is_esip2: true,
//           },
//         ] as EthscriptionTransfer[],
//       } as OkShape<DetailedMap<T>>;
//     }

//     case 'attach':
//     case 'attachment':
//     case 'blob': {
//       return {
//         ok: true,
//         result: new Uint8Array(123),
//       } as OkShape<DetailedMap<T>>;
//     }

//     default: {
//       return {
//         ok: false,
//         error: {
//           message: 'Unknown type',
//           httpStatus: 400,
//         },
//       } as NotOkShape;
//     }
//   }
// }
