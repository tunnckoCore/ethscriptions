// SPDX-License-Identifier: MPL-2.0

import { ORPCError, os } from '@orpc/server';
// Import original utilities until they are converted
import {
  isEthereumAddress,
  normalizeResult,
  upstreamFetcher,
} from '../../../src/utils.ts';
import {
  GetUserProfileInputSchema,
  GetUserProfileOutputSchema,
} from '../schemas/user-profile.ts';

export const getUserProfileProcedure = os
  .input(GetUserProfileInputSchema)
  .output(GetUserProfileOutputSchema)
  .handler(async ({ input }) => {
    const res = await upstreamFetcher({
      baseURL: input.baseURL,
      resolve: input.resolve ?? isEthereumAddress(input.user) === false,
      creator: input.user,
      media_type: 'application',
      media_subtype: 'vnd.esc.user.profile+json',
      with: input.with,
      only: input.only,
    });

    if (!res.ok) {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: res.error?.message || 'Failed to fetch user profile',
        status: res.error?.httpStatus || 500,
      });
    }

    if (res.result.length === 0) {
      throw new ORPCError('NOT_FOUND', {
        message: `User profile not set up: ${input.user}`,
        status: 404,
      });
    }

    const data = Array.isArray(res.result)
      ? res.result.map((x) =>
          normalizeResult(x, {
            with: input.with || 'content_uri',
            only: input.only,
          })
        )
      : [
          normalizeResult(res.result, {
            with: input.with || 'content_uri',
            only: input.only,
          }),
        ];

    if (data.length === 0) {
      throw new ORPCError('NOT_FOUND', {
        message: `Profile not set up: ${input.user}`,
        status: 404,
      });
    }

    // Return based on latest flag
    return input.latest
      ? data[0] // Just the latest EthscriptionBase
      : {
          latest: data[0],
          previous: data.slice(1) || [],
        }; // Full UserProfileResult
  });
