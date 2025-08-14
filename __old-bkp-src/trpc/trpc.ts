import { initTRPC, TRPCError } from '@trpc/server';
import { isAddress, namesResolver, normalizeResult } from 'src/utils.ts';
import type { OpenApiMeta } from 'trpc-to-openapi';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { z } from 'zod';

// NOTE: play with file-based routing for trpc.

import { BASE_API_URL } from '../constants.ts';
import { checkExists, getDigestForData, resolveUser } from '../index.ts';
import { ResolveUserResult } from '../types.ts';
import {
  addressSchema,
  baseEthscriptionSchema,
  booleanSchema,
  dataURISchema,
  hexSchema,
  shaSchema,
} from './schemas.ts';

//
// Example Usage:
//

export type Context = {
  baseURL: `http://${string}` | `https://${string}`;
  user: { name: string };
};

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().meta<OpenApiMeta>().create();

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */

export const cache = new Map();
export const router = t.router;
export const publicProcedure = t.procedure.use(({ ctx, next, input }) =>
  next({ ctx: { baseURL: (input as any)?.baseURL || ctx.baseURL } })
);
// .use(async ({ ctx, next, path, type, rawInput }) => {
//   console.log('middleware opts ->', { ctx, next, path, type, rawInput });

//   if (type !== 'query' || !cache.has(path)) {
//     return next();
//   }
//   let key = path;
//   if (rawInput) {
//     key += JSON.stringify(rawInput).replaceAll('"', "'");
//   }
//   const cachedData = cache.get(key);
//   if (cachedData) {
//     return {
//       ok: true,
//       data: cachedData,
//       ctx,
//     };
//   }
//   const result = await next();

//   console.log('res ->', result);

//   return result;
//   // @ts-igxnore
//   // data is not defined in the type MiddlewareResult
//   // const dataCopy = structuredClone(result.data);

//   // const ttlSecondsCallable = cache.get(path);
//   // if (ttlSecondsCallable) {
//   //   cacheSingleton.set(key, dataCopy, ttlSecondsCallable());
//   // } else {
//   //   cacheSingleton.set(key, dataCopy);
//   // }
//   // return result;
// });

export const checkExistUsingUtilProcedure = publicProcedure
  .input(
    z.object({
      sha: shaSchema,
      baseURL: z.string().url().default(BASE_API_URL),
    })
  )
  .output(
    z.object({
      exists: z.boolean(),
      ethscription: baseEthscriptionSchema.optional(),
    })
  )
  .query(async (opts) => {
    const resp = await checkExists(opts.input.sha, {
      baseURL: opts.ctx.baseURL,
    });

    if (!resp.ok) {
      throw new TRPCError(resp.error as any);
    }

    return resp.result;
  });

const checkExistStandaloneProcedure = publicProcedure
  .input(
    z.object({
      sha: shaSchema,
      baseURL: z.string().url().default(BASE_API_URL),
      endpoint: z.string().default('/ethscriptions/exists'),
    })
  )
  .output(
    z.object({
      exists: z.boolean(),
      ethscription: baseEthscriptionSchema.optional(),
    })
  )
  .query(async (opts) => {
    let baseResponse;

    try {
      baseResponse = await fetch(
        `${opts.ctx.baseURL}${opts.input.endpoint}/0x${opts.input.sha}`
      );
    } catch {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch from upstream API',
      });
    }

    if (!baseResponse.ok) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Failed checking if ethscription exists on the upstream API',
      });
    }

    const resp = await baseResponse.json();

    if (resp.result.exists) {
      const eth = resp.result.ethscription;
      return { exists: true, ethscription: normalizeResult(eth, opts) };
    }
    return { exists: false };
  });

export const appRouter = router({
  utils: router({
    checkExists: checkExistStandaloneProcedure,

    resolveUser: publicProcedure
      .input(
        z.object({
          value: z.string(),
          checkCreator: z.union([
            z.boolean().default(false),
            booleanSchema.default('false'),
          ]),
          primary: z.union([
            z.boolean().default(false),
            booleanSchema.default('false'),
          ]),
        })
      )
      .output(z.object({ name: z.string(), address: addressSchema }))
      .query(async ({ input }) => {
        const resp = await resolveUser(input.value, {
          checkCreator: input.checkCreator,
          primary: input.primary,
        });

        if (!resp.ok) {
          throw new TRPCError(resp.error as any);
        }

        return resp.result;
        // const resolveName = isAddress(input.value);

        // const resolved = await namesResolver(input.value, null, {
        //   resolveName,
        //   checkCreator: input.checkCreator,
        //   primary: input.primary,
        // });

        // if (!resolved) {
        //   throw new TRPCError({
        //     code: 'NOT_FOUND',
        //     message: `Cannot resolve ${input.value}`,
        //   });
        // }

        // const result: ResolveUserResult = resolveName
        //   ? { name: resolved as string, address: input.value as `0x${string}` }
        //   : { name: input.value as string, address: resolved as `0x${string}` };
        // return result;
      }),

    getDigestForData: publicProcedure
      .input(
        z.object({
          data: dataURISchema,
          checkExists: z.boolean().default(false),
        })
      )
      .output(
        z.object({
          sha: shaSchema,
          hex: hexSchema,
          input: z.string(),
          exists: z.boolean().optional(),
          ethscription: baseEthscriptionSchema.optional(),
        })
      )
      .query(async ({ input }) => {
        const resp = await getDigestForData(input.data, {
          checkExists: input.checkExists,
        });

        if (!resp.ok) {
          throw new TRPCError(resp.error as any);
        }

        return resp.result;
      }),
  }),
});

// export const publicClient = createPublicClient({
//   chain: mainnet,
//   transport: http(),
// });

// 15,511,721_120  /// 18,511,727_171_0 // 21,333,123_55_1
// const block = await publicClient.getBlock({ blockNumber: 21_511_721n });
// const tx0 = await publicClient.getTransactionReceipt({ hash: block.transactions[0] });
// const tx1 = await publicClient.getTransactionReceipt({ hash: block.transactions[120] });
// console.log(tx0, tx1);

const creatCallerClient = t.createCallerFactory(appRouter);

const proxyClient = creatCallerClient({
  baseURL: BASE_API_URL,
  user: { name: 'foo' },
});

const res = await proxyClient.utils.getDigestForData({
  data: 'da ',
  checkExists: true,
});

// console.log('result ->', res.ethscription?.block_number);

// const res = await proxyClient.checkExists({
//   sha: '0x161cfbb8a29429c151f2b57a9c5f9a35dab57a63aacedd5803472c5bda8ec5f9',
// });
// console.log('result ->', res);

// const urlSchema = z.string().url().default(BASE_API_URL);

// type UrlType = z.infer<typeof urlSchema>;

// const url: UrlType = 'sasa';

// urlSchema.parse('http://localhost:3000');

// export async function checkExists(sha: string, options?: any): Promise<Result<CheckExistResult>> {
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

//   const baseresp: any = await fetch(`${opts.baseURL}/ethscriptions/exists/0x${sha}`);

//   if (!baseresp.ok) {
//     return {
//       ok: false,
//       error: {
//         message: 'Cannot check if ethscription exists on the upstream api',
//         httpStatus: baseresp.status,
//       },
//     };
//   }

//   const resp = await baseresp.json();

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
