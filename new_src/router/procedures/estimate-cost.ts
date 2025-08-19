// SPDX-License-Identifier: MPL-2.0

import { ORPCError, os, safe } from '@orpc/server';
import { hexToBytes, isHexValue } from '../../../src/utils.ts';
import {
  EstimateDataCostInputSchema,
  EstimateDataCostOutputSchema,
} from '../schemas/estimate-cost.ts';
import { pricesProcedure } from './prices.ts';

export const estimateDataCostProcedure = os
  .input(EstimateDataCostInputSchema)
  .output(EstimateDataCostOutputSchema)
  .handler(async ({ input }) => {
    // Get current gas prices using safe callable pattern
    const pricesResult = await safe(pricesProcedure.callable()(input.speed));

    if (pricesResult.error) {
      throw pricesResult.error;
    }

    const prices = pricesResult.data;

    // Validate and convert input data
    const inputData = input.input;

    const isUint8 = inputData instanceof Uint8Array;
    const isDataUri = isUint8 ? false : inputData?.startsWith('data:');
    const isHexData = isUint8
      ? false
      : isHexValue(inputData?.replace(/^0x/, '')) &&
        inputData?.replace(/^0x/, '')?.startsWith('646174613a');

    const isValid = [isUint8, isDataUri, isHexData].includes(true);

    if (!isValid) {
      throw new ORPCError('BAD_REQUEST', {
        message:
          'Invalid data, must be a data URI, Uint8Array encoded data URI, or hex encoded dataURI string',
      });
    }

    try {
      // Convert input to Uint8Array for gas calculation
      let data: Uint8Array;

      if (isDataUri) {
        data = new TextEncoder().encode(inputData as string);
      } else if (isHexData) {
        data = hexToBytes((inputData as string).replace(/^0x/, ''));
      } else {
        data = inputData as Uint8Array;
      }

      // Calculate gas costs
      const dataWeiCost = calculateInputGasCost(data);
      const transferWei = 21_000n;
      const bufferWei = input.bufferFee || 0;
      const usedWei = Number(dataWeiCost + transferWei + BigInt(bufferWei));

      // Calculate total gas price in wei
      const totalGasWei = prices.gas_price
        ? prices.gas_price * 1e9
        : prices.base_fee + prices.priority_fee;

      const costWei = usedWei * totalGasWei;
      const eth = costWei / 1e18;
      const usd = eth * prices.eth_price;

      // Combine prices with input options
      const pricesWithOptions = {
        ...prices,
        speed: input.speed,
        usePrices: input.usePrices,
        bufferFee: input.bufferFee,
      };

      return {
        prices: pricesWithOptions,
        cost: {
          wei: costWei,
          eth,
          usd,
        },
        meta: {
          gasNeeded: usedWei,
          inputLength:
            typeof inputData === 'string' ? inputData.length : data.length,
        },
      };
    } catch (err: any) {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: `Failure in estimate: ${err.toString()}`,
        status: 500,
      });
    }
  });

/**
 * Calculate the input gas cost for calldata according to EIP-7623.
 *
 * EIP-7623 introduces a floor cost for calldata to prevent abuse for data availability.
 * The gas cost is the maximum of:
 * 1. Standard cost: 4 gas per zero byte + 16 gas per non-zero byte
 * 2. Floor cost: 10 gas per token (where tokens = zero_bytes + nonzero_bytes * 4)
 *
 * This function only calculates the calldata portion - execution gas and base costs
 * are handled elsewhere in the transaction gas calculation.
 *
 * @param input - The calldata bytes
 * @returns The gas cost for the calldata portion
 */
export const calculateInputGasCost = (input: Uint8Array) => {
  // EIP-7623 Constants
  const STANDARD_TOKEN_COST = 4n; // Cost per token under standard pricing
  const TOTAL_COST_FLOOR_PER_TOKEN = 10n; // Floor cost per token

  // Count zero and non-zero bytes
  let zeroBytes = 0n;
  let nonZeroBytes = 0n;

  for (const byte of input) {
    if (byte === 0) {
      zeroBytes += 1n;
    } else {
      nonZeroBytes += 1n;
    }
  }

  // Calculate tokens: zero_bytes + nonzero_bytes * 4
  const tokensInCalldata = zeroBytes + nonZeroBytes * 4n;

  // Standard cost: 4 gas per zero byte + 16 gas per non-zero byte
  // This is equivalent to STANDARD_TOKEN_COST * tokens_in_calldata
  const standardCost = STANDARD_TOKEN_COST * tokensInCalldata;

  // Floor cost: 10 gas per token
  const floorCost = TOTAL_COST_FLOOR_PER_TOKEN * tokensInCalldata;

  // EIP-7623: Return the maximum of standard cost and floor cost
  return standardCost > floorCost ? standardCost : floorCost;
};
