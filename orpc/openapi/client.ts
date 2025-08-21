import { createORPCClient, onError } from '@orpc/client';
import type { ContractRouterClient } from '@orpc/contract';
import type { JsonifiedClient } from '@orpc/openapi-client';
import { OpenAPILink } from '@orpc/openapi-client/fetch';
import { contract } from '../contract.ts';

const link = new OpenAPILink(contract, {
  url: 'http://localhost:3000/api',
  // headers: () => ({
  //   'x-api-key': 'my-api-key',
  // }),
  fetch: (request, init) => {
    return globalThis.fetch(request, {
      ...init,
      credentials: 'include', // Include cookies for cross-origin requests
    });
  },
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

export const client: JsonifiedClient<ContractRouterClient<typeof contract>> =
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
