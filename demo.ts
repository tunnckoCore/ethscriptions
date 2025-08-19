// import { createSafeClient } from '@orpc/client';
// import { call, createRouterClient, os } from '@orpc/server';
// import z from 'zod';
import { sdk, unsafeSDK } from './new_src/index.ts';
import type { GetAllEthscritionsInput } from './new_src/router/schemas/all-ethscriptions.ts';

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
try {
  const res =
    await unsafeSDK.getUserOwnedEthscriptions<GetAllEthscritionsInput>({
      baseURL: 'https://sepolia-api-v2.ethscriptions.com',
      user: 'wgw',
      resolve: true,
      page_key:
        '0x4b4650078d2f2a8fdc1fda9410dfd17f8630e322341fed8c477023f6a6e25cd2',
      // page_size: 50,
      // media_type: 'font',
      with: 'ethscription_number',
      // input: bytesToHex(new TextEncoder().encode('data:,wgw.lol')),
    });

  console.log('RESULT>>>', res);
} catch (e: any) {
  console.error(e.cause.issues);
}
// if (error) {
//   console.error(
//     'ERRRRR:',
//     error.cause,
//     JSON.stringify(getError(error), null, 2)
//     // (result?.error as any)?.data?.issues?.[0]?.errors
//   );
// } else {
//   console.log('RESULT:', data);
// }

// function getError(e: any) {
//   return (
//     e?.cause?.issues?.[0]?.errors ||
//     (e as any)?.issues ||
//     (e as any)?.data?.issues?.[0]?.errors ||
//     (e as any)?.data?.issues?.[0] ||
//     (e as any)?.data
//   );
// }
