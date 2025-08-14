import type { RouterClient } from '@orpc/server';
import { clientSideClient } from '../client/client.ts';
import type { router } from '../router/index.ts';
import { serverSideClient } from '../server/client.ts';

export const client: RouterClient<typeof router> =
  typeof window === 'undefined' || globalThis.$client
    ? serverSideClient
    : clientSideClient;
