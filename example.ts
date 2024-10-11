import assert from 'node:assert/strict';

import { getEthscriptionDetailed, getUserProfile, resolveUser } from './src/index.ts';
import { getPrices } from './src/utils.ts';

const res = await getPrices();

if (!res.ok) {
  throw new Error(res.error.message);
}

const resolveWithEns = await resolveUser('ckwf.cb.id');

if (!resolveWithEns.ok) {
  throw new Error(resolveWithEns.error.message);
}

console.log(resolveWithEns.result);

const ethscriptionName = await resolveUser('wgw'); // => wgw's address (0xA20C...)
const creatorOfEthscriptionName = await resolveUser('wgw', { checkCreator: true }); // => hirsh's address (0x205...)

const wgwAddress = `0xa20c07f94a127fd76e61fbea1019cce759225002`;
const hirshAddress = `0x2052051a0474fb0b98283b3f38c13b0b0b6a3677`;

if (ethscriptionName.ok) {
  assert.strictEqual(ethscriptionName.result.address, wgwAddress); // => true
  assert.strictEqual(ethscriptionName.result.name, 'wgw'); // => true
}

if (creatorOfEthscriptionName.ok) {
  assert.strictEqual(creatorOfEthscriptionName.result.address, hirshAddress); // => true
  assert.strictEqual(creatorOfEthscriptionName.result.name, 'wgw'); // => true
}

const profile = await getUserProfile('wgw');

if (profile.ok) {
  assert.strictEqual(profile.result.latest.creator, wgwAddress); // => true
} else {
  throw new Error(profile.error.message);
}

const eths = await getEthscriptionDetailed('1559', 'info');

if (eths.ok) {
  assert.strictEqual(eths.result.ethscription_number, '1559');
  assert.strictEqual(
    eths.result.block_blockhash,
    '0xdca25ba2b78413dfed178eec29498e5bf56232385f27f8300ea6b1fb955571b2',
  );
} else {
  throw new Error(eths.error.message);
}
