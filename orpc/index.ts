// SPDX-License-Identifier: MPL-2.0

import { createSafeClient } from '@orpc/client';
import type { RouterClient } from '@orpc/server';

import { createRouterClient } from '@orpc/server';
import { type Router, router } from './router/index.ts';

export const unsafeSDK = createRouterClient(router, {
  /**
   * Provide initial context if needed.
   *
   * Because this client instance is shared across all requests,
   * only include context that's safe to reuse globally.
   * For per-request context, use middleware context or pass a function as the initial context.
   */
  context: async () => ({
    // NOTE: for nextjs only
    // headers: await headers(), // provide headers if initial context required
  }),
});

export const unsafeSdk = unsafeSDK;

export type SDK = RouterClient<Router>;

export const sdk = createSafeClient(unsafeSDK);
