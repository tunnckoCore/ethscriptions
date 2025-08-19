// SPDX-License-Identifier: MPL-2.0

import type { RouterClient } from '@orpc/server';
import { getAllEthscriptionsProcedure } from './procedures/all-ethscriptions.ts';
import { multiCheckExistsProcedure } from './procedures/check-exists.ts';
import { getDigestForDataProcedure } from './procedures/digest.ts';
import { getEthscriptionByIdProcedure } from './procedures/ethscription-by-id.ts';
import { pricesProcedure } from './procedures/prices.ts';
import { resolveUserProcedure } from './procedures/resolve-user.ts';
import { getUserCreatedEthscriptionsProcedure } from './procedures/user-created.ts';
import { getUserOwnedEthscriptionsProcedure } from './procedures/user-owned.ts';
import { getUserProfileProcedure } from './procedures/user-profile.ts';

// Main router - procedures will be added here as they're converted
export const router = {
  prices: pricesProcedure,
  multiCheckExists: multiCheckExistsProcedure,
  resolveUser: resolveUserProcedure,
  getUserProfile: getUserProfileProcedure,
  getDigestForData: getDigestForDataProcedure,
  getUserCreatedEthscriptions: getUserCreatedEthscriptionsProcedure,
  getUserOwnedEthscriptions: getUserOwnedEthscriptionsProcedure,
  getAllEthscriptions: getAllEthscriptionsProcedure,
  getEthscriptionById: getEthscriptionByIdProcedure,
  // Procedures will be added here incrementally
  // getEthscriptionDetailed: getEthscriptionDetailedProcedure,
  // estimateDataCost: estimateDataCostProcedure,
};

// Export router type for client usage
export type Router = typeof router;
export type Client = RouterClient<Router>;
