// import { createSafeClient } from '@orpc/client';
// import { call, createRouterClient, os } from '@orpc/server';
// import z from 'zod';
import { client, unsafeClient } from './new_src/index.ts';

const [error, data] = await client.getUserProfile({
  user: 'wgw.lol',
  latest: false,
});

if (error) {
  console.error(
    'ERRRRR:',
    JSON.stringify(getError(error), null, 2)
    // (result?.error as any)?.data?.issues?.[0]?.errors
  );
} else {
  console.log('RESULT:', data);
}

function getError(e: any) {
  return (
    e?.cause?.issues?.[0]?.errors ||
    (e as any)?.issues ||
    (e as any)?.data?.issues?.[0]?.errors ||
    (e as any)?.data?.issues?.[0] ||
    (e as any)?.data
  );
}
