import { createORPCClient, onError } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import type { ContractRouterClient } from '@orpc/contract';
import type { contract } from './contract.ts';

const link = new RPCLink({
  url: 'http://localhost:3000/rpc',
  headers: () => ({
    // authorization: "Bearer token",
  }),
  // fetch: <-- provide fetch polyfill fetch if needed
  interceptors: [
    onError((error: any) => {
      console.error(
        'HANDLED ERROR:',
        error.message,
        JSON.stringify(getError(error), null, 2)
      );
    }),
  ],
});

// Create a client for your router
export const client: ContractRouterClient<typeof contract> =
  createORPCClient(link);

function getError(e: any) {
  return (
    e?.cause?.issues?.[0]?.errors ||
    (e as any)?.issues ||
    (e as any)?.data?.issues?.[0]?.errors ||
    (e as any)?.data?.issues?.[0] ||
    (e as any)?.data
  );
}
