// import { createSafeClient } from '@orpc/client';
// import { call, createRouterClient, os } from '@orpc/server';
// import z from 'zod';
// import { client } from "./orpc/http.ts";
import { sdk, unsafeSDK } from './orpc/index.ts';
import { client } from './orpc/openapi/client.ts';

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

// const res = await unsafeSDK.getDigestForData({
//   // baseURL: 'https://sepolia-api-v2.ethscriptions.com',
//   input: 'data:,wgw',
//   checkExists: true,
//   includeInput: false,
//   expand: true,
//   with: 'current_owner',
//   // input: bytesToHex(new TextEncoder().encode('data:,wgw.lol')),
// });

// const canInscribe = Boolean(res.exists?.[res.sha] === null);

const res = await client.users.getCreated({ user: 'wgw' });

console.log('RESSSS>>', res);

// const existRes = await client.utils
// 	.checkExists({
// 		inputs: ["data:,wgw", "data:,dsfsdfsdfsddf"],
// 		expand: true,
// 		with: "current_owner",
// 		only: "current_owner,transaction_hash,block_datetime",
// 	})
// 	.catch((e) => {
// 		console.error("wut?", e);
// 	});

// console.log("exists", existRes);

// const res = await unsafeSDK.getAllEthscriptions({
//   attachment_present: true,
//   // reverse: true,
//   creator: 'wgw.eth',
//   resolve: true,
//   with: 'ethscription_number',
// });
// console.log('RESULT>>>', { canInscribe }, res);
// console.log('RESULT>>>', res);

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
