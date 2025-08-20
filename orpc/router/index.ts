// SPDX-License-Identifier: MPL-2.0

import { os, type RouterClient } from "@orpc/server";
import { getAllEthscriptionsProcedure } from "./procedures/all-ethscriptions.ts";
import { multiCheckExistsProcedure } from "./procedures/check-exists.ts";
import { getDigestForDataProcedure } from "./procedures/digest.ts";
import { estimateDataCostProcedure } from "./procedures/estimate-cost.ts";
import { getEthscriptionByIdProcedure } from "./procedures/ethscription-by-id.ts";
import { getEthscriptionDetailedProcedure } from "./procedures/ethscription-detailed.ts";
import { pricesProcedure } from "./procedures/prices.ts";
import { resolveUserProcedure } from "./procedures/resolve-user.ts";
import { getUserCreatedEthscriptionsProcedure } from "./procedures/user-created.ts";
import { getUserOwnedEthscriptionsProcedure } from "./procedures/user-owned.ts";
import { getUserProfileProcedure } from "./procedures/user-profile.ts";

// Main router - procedures will be added here as they're converted
export const router = {
	createEthscription: os.handler(async () => {}),
	findEthscriptions: getAllEthscriptionsProcedure,
	getById: getEthscriptionByIdProcedure,
	getByIdDetailed: getEthscriptionDetailedProcedure,
	utils: {
		prices: pricesProcedure,
		estimateDataCost: estimateDataCostProcedure,
		checkExists: multiCheckExistsProcedure,
		resolveUser: resolveUserProcedure,
		digestForData: getDigestForDataProcedure,
	},
	users: {
		getProfile: getUserProfileProcedure,
		setProfile: os.handler(async () => {}),
		getCreated: getUserCreatedEthscriptionsProcedure,
		getOwned: getUserOwnedEthscriptionsProcedure,
	},
};

// Export router type for client usage
export type Router = typeof router;
export type Client = RouterClient<Router>;
