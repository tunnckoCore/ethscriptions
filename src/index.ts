// SPDX-License-Identifier: MPL-2.0

import { fileTypeFromBuffer } from 'file-type';
import { BASE_API_URL, CACHE_TTL } from './const.ts';
import type {
  BaseCostOpts,
  CheckExistResult,
  DigestResult,
  DigestResultWithCheck,
  EnumAllDetailed,
  // EsimtateCostOptions,
  EstimateCostResult,
  EthscriptionBase,
  EthscriptionTransfer,
  NotOkShape,
  NumbersResult,
  OkShape,
  OwnersResult,
  PricesResult,
  ResolveUserResult,
  Result,
  ResultDetailed,
  UserProfileResult,
} from './types.ts';
import {
  bytesToHex,
  createDigest,
  getHeaders,
  hexToBytes,
  isEthereumAddress,
  isHexValue,
  namesResolver,
  normalizeAndSortTransfers,
  normalizeResult,
  numberFormat,
  upstreamFetcher,
} from './utils.ts';

export async function getPrices(
  speed: 'slow' | 'normal' | 'fast' = 'normal'
): Promise<OkShape<PricesResult> | NotOkShape> {
  try {
    const resp = await fetch('https://www.ethgastracker.com/api/gas/latest');

    if (!resp.ok) {
      return {
        ok: false,
        error: {
          message: `Failed to fetch gas prices: ${resp.statusText}`,
          httpStatus: resp.status || 500,
        },
      } as NotOkShape;
    }

    const { data }: any = await resp.json();

    return {
      ok: true,
      result: {
        block_number: data.blockNr,
        base_fee: data.baseFee,
        next_fee: data.nextFee,
        eth_price: data.ethPrice,
        gas_price: data.oracle[speed].gwei,
        gas_fee: data.oracle[speed].gasFee,
        priority_fee: data.oracle[speed].priorityFee,
      } as PricesResult,
    } as OkShape<PricesResult>;
  } catch (err: any) {
    return {
      ok: false,
      error: {
        message: `Failed to fetch prices API: ${err.toString()}`,
        httpStatus: 500,
      },
    } as NotOkShape;
  }
}

export async function multiCheckExists(
  shas: string | `0x${string}` | (string | `0x${string}`)[],
  options?: any
): Promise<Result<CheckExistResult>> {
  const opts = { baseURL: BASE_API_URL, ...options };
  const shaList = (typeof shas === 'string' ? [shas] : shas)
    .filter(Boolean)
    .flatMap((x) =>
      x
        .replace('0x', '')
        .match(/[0-9a-fA-F]{64}/g)
        ?.map((z: string) => z?.replace('0x', ''))
    )
    .filter(Boolean);

  if (shaList.length === 0) {
    return {
      ok: false,
      error: {
        code: 'NO_VALID_SHA256_HASHES',
        message: 'No valid SHA-256 hashes provided',
      },
    };
  }

  if (shaList.length > 100) {
    return {
      ok: false,
      error: {
        code: 'TOO_MANY_HASHES',
        message: 'Too many hashes provided',
      },
    };
  }

  let resp: any;
  try {
    resp = await fetch(`${opts.baseURL}/ethscriptions/exists_multi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ shas: shaList.map((x) => `0x${x}`) }),
    }).then((x) => x.json());
  } catch {
    return {
      ok: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch from upstream API',
        httpStatus: 500,
      },
    };
  }

  const hasFound = Object.values(resp.result || {}).filter(Boolean).length > 0;

  if (!hasFound) {
    return {
      ok: false,
      error: {
        code: 'NOT_FOUND',
        message: 'No ethscriptions found',
        httpStatus: 404,
      },
    };
  }

  if (opts.expand) {
    const expanded = await Promise.all(
      Object.entries(resp.result).map(async ([sha, id = '']) => {
        if (!id) {
          return [sha, null];
        }
        const { ok, result } = (await getEthscriptionDetailed(
          id as string,
          'meta',
          opts
        )) as any;
        return [sha, ok ? result : id];
      })
    );

    return {
      ok: true,
      result: Object.fromEntries(expanded),
    };
  }

  return {
    ok: true,
    result: resp.result,
  };
}

// export async function singleCheckExists(
//   sha: string,
//   options?: any,
// ): Promise<Result<CheckExistResult>> {
//   const opts = { baseURL: BASE_API_URL, ...options };
//   sha = (sha || '').replace('0x', '');

//   if (!sha || (sha && sha.length !== 64) || (sha && !/^[\dA-Fa-f]{64,}$/.test(sha))) {
//     return {
//       ok: false,
//       error: {
//         message: 'Invalid SHA-256 hash, must be 64 hex characters long, or 66 if 0x-prefixed',
//         httpStatus: 400,
//       },
//     };
//   }

//   let baseResponse;

//   try {
//     baseResponse = await fetch(`${opts.baseURL}/ethscriptions/exists/0x${sha}`);
//   } catch {
//     return {
//       ok: false,
//       error: {
//         code: 'INTERNAL_SERVER_ERROR',
//         message: 'Failed to fetch from upstream API',
//         httpStatus: 500,
//       },
//     };
//   }

//   if (!baseResponse.ok) {
//     return {
//       ok: false,
//       error: {
//         code: 'BAD_REQUEST',
//         message: 'Failed checking if ethscription exists on the upstream API',
//         httpStatus: 400,
//       },
//     };
//   }

//   const resp = await baseResponse.json();

//   if (resp.result.exists) {
//     const eth = resp.result.ethscription;

//     return {
//       ok: true,
//       result: { exists: true, ethscription: normalizeResult(eth, opts) } as CheckExistResult,
//       headers: opts.headers || getHeaders(opts.cacheTtl ?? CACHE_TTL),
//     };
//   }

//   return {
//     ok: true,
//     result: { exists: false } as CheckExistResult,
//     headers: opts.headers || getHeaders(opts.cacheTtl ?? CACHE_TTL),
//   };
// }

export async function resolveUser(
  val: string,
  options?: any
): Promise<Result<ResolveUserResult>> {
  const opts = { checkCreator: false, ...options };
  const resolveName = isEthereumAddress(val);

  let resolved: any;

  try {
    resolved = await namesResolver(val, null, {
      ...opts,
      resolveName,
      checkCreator: opts.checkCreator,
    });
  } catch (error: any) {
    return {
      ok: false,
      error: {
        code: 'RESOLVER_ERROR',
        message: `Error resolving user: ${error?.message || 'Unknown error'}`,
        httpStatus: 500,
      },
    };
  }

  if (!resolved) {
    return {
      ok: false,
      error: {
        code: 'NOT_FOUND',
        message: `Cannot resolve ${val}`,
        httpStatus: 404,
      },
    };
  }

  const result: ResolveUserResult = resolveName
    ? { name: resolved as string, address: val as `0x${string}` }
    : { name: val as string, address: resolved as `0x${string}` };

  return {
    ok: true,
    result,
    headers: opts.headers || getHeaders(opts.cacheTtl ?? 3600),
  };
}

export async function getUserProfile(
  val: string,
  options?: any
): Promise<Result<UserProfileResult | UserProfileResult['latest']>> {
  const opts = { ...options };
  const res = await upstreamFetcher({
    ...opts,
    resolve: opts.resolve ?? isEthereumAddress(val) === false,
    creator: val,
    media_type: 'application',
    media_subtype: 'vnd.esc.user.profile+json',
  });

  if (!res.ok) {
    return res;
  }

  if (res.result.length === 0) {
    return {
      ok: false,
      error: {
        code: 'NOT_FOUND',
        message: `User profile not set up: ${val}`,
        httpStatus: 404,
      },
    };
  }

  const data = Array.isArray(res.result)
    ? res.result.map((x) =>
        normalizeResult(x, { ...opts, with: opts.with || 'content_uri' })
      )
    : [
        normalizeResult(res.result, {
          ...opts,
          with: opts.with || 'content_uri',
        }),
      ];

  if (data.length === 0) {
    return {
      ok: false,
      error: {
        code: 'NOT_FOUND',
        message: `Profile not set up: ${val}`,
        httpStatus: 404,
      },
    };
  }

  return {
    ok: true,
    result: opts.latest
      ? (data[0] as UserProfileResult['latest'])
      : ({
          latest: data[0],
          previous: data.slice(1) || [],
        } as UserProfileResult),
    headers: opts.headers || getHeaders(opts.cacheTtl ?? 300),
  };
}

export async function getDigestForData(
  input: `data:${string}` | `0x${string}` | Uint8Array | string,
  options?: any
): Promise<Result<DigestResult | DigestResultWithCheck>> {
  const opts = { ...options };
  const isUint8 = input instanceof Uint8Array;
  const isRawData = isUint8 ? false : input?.startsWith('data:');
  const isHexData = isUint8
    ? false
    : isHexValue(input?.replace(/^0x/, '')) &&
      input?.replace(/^0x/, '')?.startsWith('646174613a');

  const isValid = [isUint8, isRawData, isHexData].includes(true);

  if (!isValid) {
    return {
      ok: false,
      error: {
        code: 'BAD_REQUEST',
        message:
          'Invalid data, must be a data URI, as Uint8Array encoded data URI, or hex encoded dataURI string',
        httpStatus: 400,
      },
    };
  }

  try {
    const data = isRawData
      ? new TextEncoder().encode(input as string)
      : isHexData
        ? hexToBytes((input as string).replace(/^0x/, ''))
        : (input as Uint8Array);

    const sha = await createDigest(data);
    const hexed = bytesToHex(data);
    const inputData = new TextDecoder('utf-8').decode(data);

    if (opts.checkExists) {
      const resp = await multiCheckExists(sha, opts);

      if (!resp.ok) {
        return resp;
      }

      return {
        ok: true,
        result: {
          sha,
          hex: `0x${hexed}`,
          input: inputData,
          exists: resp.result,
        } as DigestResultWithCheck,
        headers: opts.headers || getHeaders(opts.cacheTtl ?? 300),
      } as Result<DigestResultWithCheck>;
    }

    return {
      ok: true,
      result: { sha, hex: `0x${hexed}`, input: inputData } as DigestResult,
      // headers: opts.headers || getHeaders(opts.cacheTtl ?? 300),
    } as Result<DigestResult>;
  } catch (err: any) {
    return {
      ok: false,
      error: {
        message: `Failure in SHA generation: ${err.toString()}`,
        httpStatus: 400,
      },
    };
  }
}

export async function getUserCreatedEthscritions(
  val: string,
  options?: any
): Promise<Result<EthscriptionBase[]>> {
  const createdByUser = await getAllEthscriptions({
    ...options,
    resolve: !isEthereumAddress(val),
    creator: val,
  });

  // { result, pagination, headers } | { error: { message, httpStatus } }
  return createdByUser;
}

export async function getUserOwnedEthscriptions(
  val: string,
  options?: any
): Promise<Result<EthscriptionBase[]>> {
  const opts = { ...options };
  const ownedByUser = await getAllEthscriptions({
    ...opts,
    resolve: opts.resolve ?? !isEthereumAddress(val),
    current_owner: val,
    fromOwned: true,
  });

  // { result, pagination, headers } | { error: { message, httpStatus } }
  return ownedByUser;
}

// optionally pass filters/params like `creator=wgw` or `initial_owner=0xAddress`, or `media_subtype=image`,
// but in object notation instead of query string
export async function getAllEthscriptions(
  options: any
): Promise<Result<EthscriptionBase[]>> {
  const opts = { ...options };
  const data: any = await upstreamFetcher(opts);

  if (!data.ok) {
    return data;
  }

  if (data.result.length === 0) {
    return {
      ok: false,
      error: {
        code: 'NOT_FOUND',
        message: opts.fromOwned
          ? `Profile not set up: ${opts.current_owner}`
          : 'No profile results found',
        httpStatus: 404,
      },
    };
  }

  return {
    ok: true,
    result: data.result.map((x: any) =>
      normalizeResult(x, opts)
    ) as EthscriptionBase[],
    pagination: data.pagination,
    headers: opts.headers || getHeaders(opts.cacheTtl ?? 15),
  };
}

// optionally pass `with` and `only` filters/params like `with=content_uri` or `only=content_uri,creator,transaction_hash`
export async function getEthscriptionById(
  id: string,
  options?: any
): Promise<Result<EthscriptionBase>> {
  return getEthscriptionDetailed(id, 'meta', options);
}

// NOTE: careful changing result fields here, because of the `as ResultDetailed<T>` assertion
// we can footgun ourselves but it's required to be able to have editor complitions!
export async function getEthscriptionDetailed<T extends EnumAllDetailed>(
  id: string,
  type: T,
  options?: any
): Promise<ResultDetailed<T>> {
  if (!type) {
    return {
      ok: false,
      error: { message: 'The `type` argument is required ', httpStatus: 500 },
    };
  }

  const opts = { ...options };
  const data: any = await upstreamFetcher(opts, id);

  if (!data.ok) {
    return data;
  }

  const result = normalizeResult(data.result, opts);

  if (/meta/.test(type)) {
    return {
      ok: true,
      result: result as EthscriptionBase,
      headers: opts.headers || getHeaders(CACHE_TTL),
    } as ResultDetailed<T>;
  }

  // NOTE: keep in mind that it can resolve to empty if there's attachment/blob (ESIP-8) instead,
  // because in most cases when ESIP-8 Blobscription is created the regular Ethscription is `data:;esip6` as "content_uri"
  if (/content|data/i.test(type)) {
    // use `data.result` instead of `result` because `content_uri` is not included in `result` by default
    const contentBuffer = await fetch(data.result.content_uri).then((res) =>
      res.arrayBuffer()
    );
    const { mime = '' } = (await fileTypeFromBuffer(contentBuffer)) || {};

    return {
      ok: true,
      result: new Uint8Array(contentBuffer),
      headers: opts.headers
        ? {
            ...opts.headers,
            'content-type': result.content_type,
            ...(mime?.includes('gzip') ? { 'content-encoding': 'gzip' } : {}),
          }
        : getHeaders(CACHE_TTL, {
            'content-type': result.content_type,
            ...(mime?.includes('gzip') ? { 'content-encoding': 'gzip' } : {}),
          }),
    } as ResultDetailed<T>;
  }

  if (/owner|creator|receiver|previous|initial/i.test(type)) {
    // use `data.result` because transfers does not exists in `result` by default
    const transfers = normalizeAndSortTransfers(
      data.result.ethscription_transfers
    );

    // NOTE: careful changing fields here, because of the `as ResultDetailed<T>` we can actually footgun
    return {
      ok: true,
      result: {
        latest_transfer_timestamp: transfers[0].block_timestamp,
        latest_transfer_datetime: new Date(
          Number(result.block_timestamp) * 1000
        ).toISOString(),
        latest_transfer_block: transfers[0].block_number,
        creator: result.creator,
        initial: data.result.initial_owner,
        current: data.result.current_owner,
        previous: data.result.previous_owner,
      } as OwnersResult,

      // transfers theoretically can occure only after 1-5 blocks (60 seconds, so 45s is fine)
      headers: opts.headers || getHeaders(45),
    } as ResultDetailed<T>;
  }

  if (/number|index|stat|info/i.test(type)) {
    result;
    return {
      ok: true,
      result: {
        block_timestamp: result.block_timestamp,
        block_datetime: new Date(
          Number(result.block_timestamp) * 1000
        ).toISOString(),
        block_blockhash: result.block_blockhash,
        block_number: result.block_number,
        block_number_fmt: numberFormat(result.block_number),
        transaction_index: result.transaction_index,
        event_log_index: result.event_log_index ?? null,
        ethscription_number: data.result.ethscription_number ?? null,
        ethscription_number_fmt: data.result.ethscription_number
          ? numberFormat(data.result.ethscription_number ?? '')
          : '',
        transfers_count: String(
          normalizeAndSortTransfers(data.result.ethscription_transfers).filter(
            (x) => x.is_esip0 === false
          ).length
        ),
      } as NumbersResult,
      headers: opts.headers || getHeaders(60),
    } as ResultDetailed<T>;
  }

  if (/transfer/i.test(type)) {
    return {
      ok: true,
      result: normalizeAndSortTransfers(
        data.result.ethscription_transfers
      ) as EthscriptionTransfer[],
      pagination: data.pagination,
      // transfers theoretically can occure only after 5 blocks (60 seconds, so 45s is fine)
      headers: opts.headers || getHeaders(45),
    } as ResultDetailed<T>;
  }

  // NOTE: there's `blob(s)` alternativee because  `/attachment` may be buggy on some hosting providers,
  // noticed that when hosted on Netlify it doesn't like endpoints ending with `/attachment`
  if (/attach|attachment|blob/i.test(type)) {
    if (!data.result.attachment_sha) {
      return {
        ok: false,
        error: {
          message:
            'No attachment for this ethscription, it is not an ESIP-8 compatible Blobscription',
          httpStatus: 404,
        },
      };
    }

    // fetch the attachment content directly from upstream
    const res = await upstreamFetcher(opts, `${id}/attachment`);

    if (!res.ok) {
      return res;
    }

    return {
      ok: true,
      result: res.result as Uint8Array,
      headers: opts.headers
        ? {
            ...opts.headers,
            'content-type': data.result.attachment_content_type,
          }
        : getHeaders(CACHE_TTL, {
            'content-type': data.result.attachment_content_type,
          }),
    } as ResultDetailed<T>;
  }

  return {
    ok: false,
    error: { message: 'Invalid request', httpStatus: 400 },
  };
}

export async function estimateDataCost(
  input: `data:${string}` | `0x${string}` | Uint8Array | string,
  options?: BaseCostOpts
): Promise<Result<EstimateCostResult>> {
  const cfg = {
    speed: 'normal',
    usePrices: true,
    bufferFee: 0,
    ...options,
  } as BaseCostOpts;
  const prices = await getPrices(cfg.speed);

  if (!prices.ok) {
    return prices;
  }

  const opts = { ...prices.result, ...cfg } as PricesResult & BaseCostOpts;

  const isUint8 = input instanceof Uint8Array;
  const isDataUri = isUint8 ? false : input?.startsWith('data:');
  const isHexData = isUint8
    ? false
    : isHexValue(input?.replace(/^0x/, '')) &&
      input?.replace(/^0x/, '')?.startsWith('646174613a');

  const isValid = [isUint8, isDataUri, isHexData].includes(true);

  if (!isValid) {
    return {
      ok: false,
      error: {
        message:
          'Invalid data, must be a data URI as Uint8Array encoded data URI, or hex encoded dataURI string',
        httpStatus: 400,
      },
    };
  }

  try {
    const data = isDataUri
      ? new TextEncoder().encode(input as string)
      : isHexData
        ? hexToBytes((input as string).replace(/^0x/, ''))
        : (input as Uint8Array);

    const dataWei = data.reduce((acc, byte) => acc + (byte === 0 ? 4 : 16), 0);
    const transferWei = 21_000;
    const bufferWei = opts.bufferFee || 0;
    const usedWei = dataWei + transferWei + bufferWei;
    const totalGasWei = opts.gas_price
      ? opts.gas_price * 1e9
      : opts.base_fee + opts.priority_fee;
    const costWei = usedWei * totalGasWei;

    const eth = costWei / 1e18;
    const usd = eth * Number(opts.eth_price);

    opts.block_number = Number(opts.block_number);

    return {
      ok: true,
      result: {
        prices: opts as PricesResult & BaseCostOpts,
        cost: { wei: costWei, eth, usd },
        meta: { gasNeeded: usedWei, inputLength: input.length },
      },
    };
  } catch (err: any) {
    return {
      ok: false,
      error: {
        message: `Failure in estimate: ${err.toString()}`,
        httpStatus: 500,
      },
    };
  }
}
