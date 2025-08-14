// import { createSafeClient } from '@orpc/client';
// import { call, createRouterClient, os } from '@orpc/server';
// import z from 'zod';
import { client, unsafeClient } from './new_src/index.ts';

// DO NOT REMOVE
// const [error, data] = await client.getDigestForData({
//   input: 'data:,wgw.lol',
//   checkExists: true,
//   expand: true,
//   with: 'content_uri,ethscription_number',
//   only: 'content_uri,ethscription_number,transation_index,transaction_hash,block_number,block_hash',
// });

// UPDATE WHEN DONE WITH A PROCEDURE
// const [error, data] = await client.getUserCreatedEthscriptions({
//   user: 'wgw',
//   page_size: 5,
// });
const [error, data] = await [null, 1];

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
