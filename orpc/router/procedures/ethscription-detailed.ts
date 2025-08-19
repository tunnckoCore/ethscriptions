// SPDX-License-Identifier: MPL-2.0

import { ORPCError, os } from '@orpc/server';
import {
  normalizeAndSortTransfers,
  normalizeResult,
  numberFormat,
  upstreamFetcher,
} from '../../../src/utils.ts';
import {
  GetEthscriptionDetailedInputSchema,
  type GetEthscriptionDetailedOutput,
  GetEthscriptionDetailedOutputSchema,
} from '../schemas/ethscription-detailed.ts';

export const getEthscriptionDetailedProcedure = os
  .input(GetEthscriptionDetailedInputSchema)
  .output(GetEthscriptionDetailedOutputSchema)
  .handler(async ({ input }) => {
    const { id, mode, ...opts } = { ...input };
    const data: any = await upstreamFetcher(opts, id);

    if (!data.ok) {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: data.error?.message || 'Failed to fetch from upstream API',
        status: data.error?.httpStatus || 500,
      });
    }

    const result = normalizeResult(data.result, opts);

    // Handle different return types based on mode
    if (/meta|metadata/.test(mode)) {
      return result as unknown as GetEthscriptionDetailedOutput;
    }

    if (/content|data/i.test(mode)) {
      // Fetch content from content_uri and return as Uint8Array
      try {
        const contentBuffer = await fetch(data.result.content_uri).then((res) =>
          res.arrayBuffer()
        );
        return new Uint8Array(
          contentBuffer
        ) as unknown as GetEthscriptionDetailedOutput;
      } catch (err: any) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: `Failed to fetch content: ${err.toString()}`,
          status: 500,
        });
      }
    }

    if (/owner|creator|receiver|previous|initial/i.test(mode)) {
      // Process transfers and return OwnersResult
      const transfers = normalizeAndSortTransfers(
        data.result.ethscription_transfers
      );

      return {
        latest_transfer_timestamp: transfers[0].block_timestamp,
        latest_transfer_datetime: new Date(
          Number(result.block_timestamp) * 1000
        ).toISOString(),
        latest_transfer_block: transfers[0].block_number,
        creator: result.creator,
        initial: data.result.initial_owner,
        current: data.result.current_owner,
        previous: data.result.previous_owner,
      } as unknown as GetEthscriptionDetailedOutput;
    }

    if (/number|index|stat|info/i.test(mode)) {
      // Return NumbersResult
      return {
        block_timestamp: result.block_timestamp,
        block_datetime: new Date(
          Number(result.block_timestamp) * 1000
        ).toISOString(),
        block_hash: result.block_hash,
        block_number: result.block_number,
        block_number_fmt: numberFormat(result.block_number),
        transaction_index: result.transaction_index,
        event_log_index: result.event_log_index ?? null,
        ethscription_number: data.result.ethscription_number
          ? Number(data.result.ethscription_number)
          : null,
        ethscription_number_fmt: data.result.ethscription_number
          ? numberFormat(data.result.ethscription_number ?? '')
          : '',
        transfers_count: String(
          normalizeAndSortTransfers(data.result.ethscription_transfers).filter(
            (x) => x.is_esip0 === false
          ).length
        ),
      } as unknown as GetEthscriptionDetailedOutput;
    }

    if (/transfer/i.test(mode)) {
      const resp = normalizeAndSortTransfers(
        data.result.ethscription_transfers
      ) as unknown as GetEthscriptionDetailedOutput;

      return resp;
    }

    if (/attach|attachment|blob/i.test(mode)) {
      // Handle attachment/blob data
      if (!data.result.attachment_sha) {
        throw new ORPCError('NOT_FOUND', {
          message:
            'No attachment for this ethscription, it is not an ESIP-8 compatible Blobscription',
          status: 404,
        });
      }

      try {
        // Fetch the attachment content directly from upstream
        const res = await upstreamFetcher(opts, `${input.id}/attachment`);

        if (!res.ok) {
          throw new ORPCError('INTERNAL_SERVER_ERROR', {
            message: res.error?.message || 'Failed to fetch attachment',
            status: res.error?.httpStatus || 500,
          });
        }

        return res.result as unknown as GetEthscriptionDetailedOutput;
      } catch (err: any) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: `Failed to fetch attachment: ${err.toString()}`,
          status: 500,
        });
      }
    }

    throw new ORPCError('BAD_REQUEST', {
      message: 'Invalid request mode',
      status: 400,
    });
  });
