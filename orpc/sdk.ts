// SPDX-License-Identifier: MPL-2.0

import { createSafeClient, onError } from '@orpc/client';

import { createRouterClient } from '@orpc/server';
import { type Router, router } from './router.ts';

export const unsafeSDK = createUnsafeSdk();

export function createUnsafeSdk(context = { headers: new Headers() }) {
  return createRouterClient(router, {
    interceptors: [
      onError((error: any) => {
        console.error(
          'HANDLED ERROR:',
          error.message,
          JSON.stringify(getError(error), null, 2)
        );
      }),
    ],

    /**
     * Provide initial context if needed.
     *
     * Because this client instance is shared across all requests,
     * only include context that's safe to reuse globally.
     * For per-request context, use middleware context or pass a function as the initial context.
     */
    context,
  });
}

export type EthscriptionSDK = Router;
export const sdk = createSafeClient(unsafeSDK);

function getError(e: any) {
  return (
    e?.cause?.issues?.[0]?.errors ||
    (e as any)?.issues ||
    (e as any)?.data?.issues?.[0]?.errors ||
    (e as any)?.data?.issues?.[0] ||
    (e as any)?.data
  );
}
