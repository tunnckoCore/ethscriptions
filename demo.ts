// import { createSafeClient } from '@orpc/client';
// import { call, createRouterClient, os } from '@orpc/server';
// import z from 'zod';
import { sdk } from './new_src/index.ts';
import { bytesToHex } from './src/utils.ts';

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
const [error, data] = await sdk.multiCheckExists({
  shas: '0x2817fd9cf901e4435253881550731a5edc5e519c19de46b08e2b19a18e95143e',
  expand: true,
  with: 'ethscription_number',
  only: 'ethscription_number,transaction_index,block_hash,transaction_hash',
});

if (error) {
  console.error(
    'ERRRRR:',
    error,
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
