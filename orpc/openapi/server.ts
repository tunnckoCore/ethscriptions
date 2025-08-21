import { OpenAPIGenerator } from '@orpc/openapi';
import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { OpenAPIReferencePlugin } from '@orpc/openapi/plugins';
// import { OpenAPIReferencePlugin } from '@orpc/openapi/plugins';
import { CORSPlugin } from '@orpc/server/plugins';
import {
  experimental_ZodSmartCoercionPlugin,
  ZodToJsonSchemaConverter,
} from '@orpc/zod/zod4';
import { router } from '../router.ts';

const handler = new OpenAPIHandler(router, {
  plugins: [
    new CORSPlugin({
      exposeHeaders: ['Content-Disposition'],
    }),
    new experimental_ZodSmartCoercionPlugin(),
    new OpenAPIReferencePlugin({
      // docsPath: '/docs',
      // specPath: '/spec.json',
      schemaConverters: [new ZodToJsonSchemaConverter()],
      specGenerateOptions: {
        info: {
          title: 'Ethscriptions API Playground',
          version: '3.0.0',
        },
      },
    }),
  ],
});

async function handleRequest(request: Request) {
  const { response } = await handler.handle(request, {
    prefix: '/api',
    context: {
      headers: new Headers(request.headers),
    },
  });

  return response ?? new Response('Not Found', { status: 404 });
}

export default {
  async fetch(request: Request) {
    const response = await handleRequest(request);
    return response;
  },
};
