// SPDX-License-Identifier: MPL-2.0

import type { RouterClient } from '@orpc/server';
import { multiCheckExistsProcedure } from './procedures/check-exists.ts';
import { getDigestForDataProcedure } from './procedures/digest.ts';
import { pricesProcedure } from './procedures/prices.ts';
import { resolveUserProcedure } from './procedures/resolve-user.ts';
import { getUserProfileProcedure } from './procedures/user-profile.ts';

// Main router - procedures will be added here as they're converted
export const router = {
  prices: pricesProcedure,
  multiCheckExists: multiCheckExistsProcedure,
  resolveUser: resolveUserProcedure,
  getUserProfile: getUserProfileProcedure,
  getDigestForData: getDigestForDataProcedure,
  // Procedures will be added here incrementally
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
