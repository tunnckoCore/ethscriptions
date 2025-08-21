import { RPCHandler } from '@orpc/server/fetch';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { router } from './router.ts';

const app = new Hono();

const handler = new RPCHandler(router);

app.use(logger());

app.use('/rpc/*', async (c, next) => {
  const { matched, response } = await handler.handle(c.req.raw, {
    prefix: '/rpc',
    context: {
      headers: new Headers(c.req.raw.headers),
    }, // Provide initial context if needed
  });

  if (matched) {
    return c.newResponse(response.body, response);
  }

  await next();
});

export default app;
