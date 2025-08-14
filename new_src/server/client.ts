import { createRouterClient } from '@orpc/server';
import { router } from '../router/index.ts';

export const serverSideClient = createRouterClient(router, {
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

globalThis.$client = serverSideClient;

export type ServerClient = typeof serverSideClient;
