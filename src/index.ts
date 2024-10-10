// SPDX-License-Identifier: MPL-2.0

import { BASE_API_URL, CACHE_TTL } from './constants.ts';
import {
  bytes2hex,
  createDigest,
  getHeaders,
  hex2bytes,
  isAddress,
  namesResolver,
  normalizeAndSortTransfers,
  normalizeResult,
  numfmt,
  upstreamFetcher,
} from './utils.ts';

export async function checkExists(sha: string, options?: any) {
  const opts = { baseURL: BASE_API_URL, ...options };
  sha = (sha || '').replace('0x', '');

  if (!sha || (sha && sha.length !== 64) || (sha && !/^[\dA-Fa-f]{64,}$/.test(sha))) {
    return {
      error: {
        message: 'Invalid SHA-256 hash, must be 64 hex characters long, or 66 if 0x-prefixed',
        httpStatus: 400,
      },
    };
  }

  const baseresp: any = await fetch(`${opts.baseURL}/ethscriptions/exists/0x${sha}`);

  if (!baseresp.ok) {
    return {
      error: {
        message: 'Cannot check if ethscription exists on the upstream api',
        httpStatus: baseresp.status,
      },
    };
  }

  const resp = await baseresp.json();

  if (resp.result.exists) {
    const eth = resp.result.ethscription;

    return {
      result: { exists: true, ethscription: normalizeResult(eth, opts) },
      headers: opts.headers || getHeaders(opts.cacheTtl ?? CACHE_TTL),
    };
  }

  return { result: { exists: false } };
}

export async function resolveUser(val: string, options?: any) {
  const opts = { checkCreator: false, ...options };
  const resolveName = isAddress(val);

  const resolved = await namesResolver(val, null, { resolveName, checkCreator: opts.checkCreator });

  if (!resolved) {
    return { error: { message: `Cannot resolve ${val}`, httpStatus: 404 } };
  }

  const result = resolveName ? { name: resolved, address: val } : { name: val, address: resolved };
  return { result, headers: opts.headers || getHeaders(opts.cacheTtl ?? 3600) };
}

export async function getUserProfile(val: string, options?: any) {
  const opts = { ...options };
  const res: any = await upstreamFetcher({
    resolve: !isAddress(val),
    creator: val,
    media_type: 'application',
    media_subtype: 'vnd.esc.user.profile+json',
  });

  if (res.error) {
    return res;
  }

  const data = Array.isArray(res.result)
    ? res.result.map((x) => normalizeResult(x, { with: 'content_uri' }))
    : [normalizeResult(res.result, { with: 'content_uri' })];

  return {
    result: {
      latest: data[0],
      previous: data.slice(1) || [],
    },
    headers: opts.headers || getHeaders(opts.cacheTtl ?? 300),
  };
}

export async function getDigestForData(input: string | `0x${string}` | Uint8Array, options?: any) {
  const opts = { ...options };
  const isUint8 = input instanceof Uint8Array;
  const isRawData = isUint8 ? false : input?.startsWith('data:');
  const isHexData = isUint8 ? false : input?.startsWith('0x646174613a');
  const isB64Data = !isUint8 && !isRawData && !isHexData;

  if (!isUint8 && !isRawData && !isHexData && !isB64Data) {
    return {
      error: {
        message:
          'Invalid data, must be a data URI, as Uint8Array encoded data URI, or base64 / hex encoded dataURI string',
        httpStatus: 400,
      },
    };
  }

  try {
    const data = isRawData
      ? new TextEncoder().encode(input as string)
      : isHexData
        ? hex2bytes((input as string).slice(2))
        : isB64Data
          ? new TextEncoder().encode(atob(input as string))
          : (input as Uint8Array);

    const sha = await createDigest(data);
    const hexed = bytes2hex(data);
    const inputData = new TextDecoder('utf8').decode(data);

    if (opts.checkExists) {
      const resp = await checkExists(sha, opts);
      if (resp.error) {
        return resp;
      }

      return {
        result: { sha, hex: `0x${hexed}`, input: inputData, ...resp.result },
        headers: opts.headers || getHeaders(opts.cacheTtl ?? 300),
      };
    }

    return {
      result: { sha, hex: `0x${hexed}`, input: inputData },
      headers: opts.headers || getHeaders(opts.cacheTtl ?? 300),
    };
  } catch (err: any) {
    return {
      error: {
        message: `Failure in SHA generation: ${err.toString()}`,
        httpStatus: 400,
      },
    };
  }
}

export async function getUserCreatedEthscritions(val: string, options?: any) {
  const createdByUser = await getAllEthscriptions({
    ...options,
    resolve: !isAddress(val),
    creator: val,
  });

  // { result, pagination, headers } | { error: { message, httpStatus } }
  return createdByUser;
}

export async function getUserOwnedEthscriptions(val: string, options?: any) {
  const ownedByUser = await getAllEthscriptions({
    ...options,
    resolve: !isAddress(val),
    current_owner: val,
  });

  // { result, pagination, headers } | { error: { message, httpStatus } }
  return ownedByUser;
}

// optionally pass filters/params like `creator=wgw` or `initial_owner=0xAddress`, or `media_subtype=image`,
// but in object notation instead of query string
export async function getAllEthscriptions(options: any) {
  const opts = { ...options };
  const data: any = await upstreamFetcher(options);

  if (data.error) {
    return data;
  }

  return {
    result: data.result.map((x: any) => normalizeResult(x, options)),
    pagination: data.pagination,
    headers: opts.headers || getHeaders(opts.cacheTtl ?? 15),
  };
}

// optionally pass `with` and `only` filters/params like `with=content_uri` or `only=content_uri,creator,transaction_hash`
export async function getEthscriptionById(id: string, options?: any) {
  return getEthscriptionDetailed(id, 'meta', options);
}

export async function getEthscriptionDetailed(id: string, type: string, options?: any) {
  if (!type) {
    return { error: { message: 'The `type` argument is required ', httpStatus: 500 } };
  }

  const opts = { ...options };
  const data: any = await upstreamFetcher(opts, id);

  if (data.error) {
    return data;
  }

  const result = normalizeResult(data.result, opts);

  if (/meta/.test(type)) {
    return { result, headers: opts.headers || getHeaders(CACHE_TTL) };
  }

  // NOTE: keep in mind that it can resolve to empty if there's attachment/blob (ESIP-8) instead,
  // because in most cases when ESIP-8 Blobscription is created the regular Ethscription is `data:;esip6` as "content_uri"
  if (/content|data/i.test(type)) {
    // use `data.result` instead of `result` because `content_uri` is not included in `result` by default
    const contentBuffer = await fetch(data.result.content_uri).then((res) => res.arrayBuffer());

    return {
      result: contentBuffer,
      headers: opts.headers
        ? { ...opts.headers, 'content-type': result.content_type }
        : getHeaders(CACHE_TTL, {
            'content-type': result.content_type,
          }),
    };
  }

  if (/owner|creator|receiver|previous|initial/i.test(type)) {
    // use `data.result` because transfers does not exists in `result` by default
    const transfers = normalizeAndSortTransfers(data.result);
    return {
      result: {
        latest_transfer_timestamp: transfers[0].block_timestamp,
        latest_transfer_datetime: new Date(Number(result.block_timestamp) * 1000).toISOString(),
        latest_transfer_block: transfers[0].block_number,
        creator: result.creator,
        initial: result.initial_owner,
        current: result.current_owner,
        previous: result.previous_owner,
      },

      // transfers theoretically can occure only after 5 blocks (60 seconds, so 45s is fine)
      headers: opts.headers || getHeaders(45),
    };
  }

  if (/number|index|stat|info/i.test(type)) {
    return {
      result: {
        block_timestamp: result.block_timestamp,
        block_datetime: new Date(Number(result.block_timestamp) * 1000).toISOString(),
        block_blockhash: result.block_blockhash,
        block_number: result.block_number,
        block_number_fmt: numfmt(result.block_number),
        transaction_index: result.transaction_index,
        event_log_index: result.event_log_index,
        ethscription_number: result.ethscription_number,
        ethscription_number_fmt: numfmt(result.ethscription_number),
        ethscription_transfers: String(
          normalizeAndSortTransfers(result).filter((x) => x.is_esip0 === false).length,
        ),
      },
      headers: opts.headers || getHeaders(60),
    };
  }

  if (/transfer/i.test(type)) {
    return {
      result: { transfers: normalizeAndSortTransfers(result) },
      // transfers theoretically can occure only after 5 blocks (60 seconds, so 45s is fine)
      headers: opts.headers || getHeaders(45),
    };
  }

  // NOTE: there's `blob(s)` alternativee because  `/attachment` may be buggy on some hosting providers,
  // noticed that when hosted on Netlify it doesn't like endpoints ending with `/attachment`
  if (/attach|attachment|blob/i.test(type)) {
    if (!data.result.attachment_sha) {
      return {
        error: {
          message:
            'No attachment for this ethscription, it is not an ESIP-8 compatible Blobscription',
          httpStatus: 404,
        },
      };
    }

    // fetch the attachment content directly from upstream
    const res: any = await upstreamFetcher(opts, `${id}/attachment`);

    if (res.error) {
      return res;
    }

    return {
      result: res.result,
      headers: opts.headers
        ? { ...opts.headers, 'content-type': data.result.attachment_content_type }
        : getHeaders(CACHE_TTL, { 'content-type': data.result.attachment_content_type }),
    };
  }

  return { error: { message: 'Invalid request', httpStatus: 400 } };
}
