// SPDX-License-Identifier: MPL-2.0

import type { RouterClient } from '@orpc/server';
import { multiCheckExistsProcedure } from './procedures/check-exists.ts';
import { pricesProcedure } from './procedures/prices.ts';

// Main router - procedures will be added here as they're converted
export const router = {
  prices: pricesProcedure,
  multiCheckExists: multiCheckExistsProcedure,
  // Procedures will be added here incrementally
  // resolveUser: resolveUserProcedure,
  // getUserProfile: getUserProfileProcedure,
  // getDigestForData: getDigestForDataProcedure,
  // getUserCreatedEthscriptions: getUserCreatedEthscriptionsProcedure,
  // getUserOwnedEthscriptions: getUserOwnedEthscriptionsProcedure,
  // getAllEthscriptions: getAllEthscriptionsProcedure,
  // getEthscriptionById: getEthscriptionByIdProcedure,
  // getEthscriptionDetailed: getEthscriptionDetailedProcedure,
  // estimateDataCost: estimateDataCostProcedure,
};

// Export router type for client usage
export type Router = typeof router;
export type Client = RouterClient<Router>;
