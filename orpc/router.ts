import { os } from './contract-os.ts';
import { multiCheckExistsProcedure } from './procedures/check-exists.ts';
import { getDigestForDataProcedure } from './procedures/digest.ts';
import { estimateDataCostProcedure } from './procedures/estimate-cost.ts';
import { getEthscriptionByIdProcedure } from './procedures/ethscription-by-id.ts';
import { getEthscriptionDetailedProcedure } from './procedures/ethscription-detailed.ts';
import { findEthscriptionsProcedure } from './procedures/find-ethscriptions.ts';
import { getPricesProcedure } from './procedures/get-prices.ts';
import { resolveUserProcedure } from './procedures/resolve-user.ts';
import { getUserCreatedEthscriptionsProcedure } from './procedures/user-created.ts';
import { getUserOwnedEthscriptionsProcedure } from './procedures/user-owned.ts';
import { getUserProfileProcedure } from './procedures/user-profile.ts';

export const router = os.router({
  createEthscription: os.createEthscription.handler(() => null),
  findEthscriptions: findEthscriptionsProcedure,
  getById: getEthscriptionByIdProcedure,
  getByIdDetailed: getEthscriptionDetailedProcedure,
  users: {
    getCreated: getUserCreatedEthscriptionsProcedure,
    getOwned: getUserOwnedEthscriptionsProcedure,
    getProfile: getUserProfileProcedure,
    setProfile: os.users.setProfile.handler(async () => null),
  },
  utils: {
    checkExists: multiCheckExistsProcedure,
    digestForData: getDigestForDataProcedure,
    estimateDataCost: estimateDataCostProcedure,
    getPrices: getPricesProcedure,
    resolveUser: resolveUserProcedure,
  },
});

export type Router = typeof router;
