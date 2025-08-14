import { client, unsafeClient } from './new_src/index.ts';

const result = await client.resolveUser({
  user: 'wgw.lol',
});

if (result.error) {
  console.error(
    'ResolveUser:',
    (result?.error as any)?.data?.issues?.[0]?.errors
  );
} else {
  console.log('ResolveUser:', result.data);
}
