import { client, unsafeClient } from './new_src/index.ts';

const [error, data] = await client.prices('normal');

console.log('Error:', error?.data, error, 'Data:', data);
