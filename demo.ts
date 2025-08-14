import { client, unsafeClient } from './new_src/index.ts';

const result = await unsafeClient.multiCheckExists({
  shas: [
    '16dc7fef8bdc3373e19e69317ba55d0de9d231f03f7207cad862990190e61f1d',
    '0x81740cc2e5ef16ceb400a633f236924ab2a80e499763079d7c42ac3ba44d5675',
  ],
  // expand: true,
});

console.log('MultiCheckExists:', result);
