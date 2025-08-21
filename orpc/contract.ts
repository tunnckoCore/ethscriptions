import {
  type InferContractRouterInputs,
  type InferContractRouterOutputs,
  oc,
} from '@orpc/contract';
import z from 'zod';
import {
  GetAllEthscritionsInputSchema,
  GetAllEthscritionsOutputSchema,
} from './schemas/all-ethscriptions.ts';
import {
  MultiCheckExistsInputSchema,
  MultiCheckExistsOutputSchema,
} from './schemas/check-exists.ts';
import {
  GetDigestForDataInputSchema,
  GetDigestForDataOutputSchema,
} from './schemas/digest.ts';
import {
  EstimateDataCostInputSchema,
  EstimateDataCostOutputSchema,
} from './schemas/estimate-cost.ts';
import {
  GetEthscriptionByIdInputSchema,
  GetEthscriptionByIdOutputSchema,
} from './schemas/ethscription-by-id.ts';
import {
  GetEthscriptionDetailedInputSchema,
  GetEthscriptionDetailedOutputSchema,
} from './schemas/ethscription-detailed.ts';
import {
  GetPricesInputSchema,
  GetPricesOutputSchema,
} from './schemas/get-prices.ts';
import { EthereumAddressSchema } from './schemas/index.ts';
import {
  ResolveUserInputSchema,
  ResolveUserOutputSchema,
} from './schemas/resolve-user.ts';
import {
  GetUserProfileInputSchema,
  GetUserProfileOutputSchema,
} from './schemas/user-profile.ts';

export const contract = {
  createEthscription: oc
    .route({
      path: '/ethscriptions',
      method: 'POST',
      successStatus: 201,
      summary: 'Create a new ethscription',
      tags: ['general'],
    })
    .input(z.any())
    .output(z.any()),

  findEthscriptions: oc
    .route({
      path: '/ethscriptions',
      method: 'GET',
      summary: 'Find ethscriptions',
      tags: ['general'],
    })
    .input(
      GetAllEthscritionsInputSchema.extend({
        user: EthereumAddressSchema.or(z.string().min(1)),
      })
    )
    .output(GetAllEthscritionsOutputSchema),

  getById: oc
    .route({
      path: '/ethscriptions/{id}',
      method: 'GET',
      summary: 'Get an ethscription by ID (main metadata)',
      tags: ['general'],
    })
    .input(GetEthscriptionByIdInputSchema)
    .output(GetEthscriptionByIdOutputSchema),

  getByIdDetailed: oc
    .route({
      path: '/ethscriptions/{id}/{mode}',
      method: 'GET',
      summary: 'Get an ethscription by ID, more detailed and granular',
      tags: ['general'],
    })
    .input(GetEthscriptionDetailedInputSchema)
    .output(GetEthscriptionDetailedOutputSchema),

  users: {
    getCreated: oc
      .route({
        path: '/users/{user}/created',
        method: 'GET',
        summary: 'Get all ethscriptions created by a user',
        tags: ['users'],
      })
      .input(
        GetAllEthscritionsInputSchema.extend({
          user: EthereumAddressSchema.or(z.string().min(1)),
        })
      )
      .output(GetAllEthscritionsOutputSchema),

    getOwned: oc
      .route({
        path: '/users/{user}/owned',
        method: 'GET',
        summary: 'Get all ethscriptions owned by a user',
        tags: ['users'],
      })
      .input(
        GetAllEthscritionsInputSchema.extend({
          user: EthereumAddressSchema.or(z.string().min(1)),
        })
      )
      .output(GetAllEthscritionsOutputSchema),

    getProfile: oc
      .route({
        path: '/users/{user}',
        method: 'GET',
        summary: "Get a user's profile and changes history",
        tags: ['users'],
      })
      .input(GetUserProfileInputSchema)
      .output(GetUserProfileOutputSchema),

    setProfile: oc
      .route({
        path: '/users/{user}',
        method: 'POST',
        summary: "Set a user's profile information",
        tags: ['users'],
      })
      .input(
        z.object({
          user: EthereumAddressSchema.or(z.string().min(1)),
        })
      )
      .output(z.any()),
  },

  utils: {
    checkExists: oc
      .route({
        path: '/utils/exists',
        method: 'POST',
        summary: 'Check if ethscription exists; supports multiple',
        tags: ['utils'],
      })
      .input(MultiCheckExistsInputSchema)
      .output(MultiCheckExistsOutputSchema),

    digestForData: oc
      .route({
        path: '/utils/digest',
        method: 'POST',
        summary: 'Get the sha256 digest and hex for a given data',
        tags: ['utils'],
      })
      .input(GetDigestForDataInputSchema)
      .output(GetDigestForDataOutputSchema),

    estimateDataCost: oc
      .route({
        path: '/utils/estimate',
        method: 'POST',
        summary: 'Estimate the cost of storing data',
        tags: ['utils'],
      })
      .input(EstimateDataCostInputSchema)
      .output(EstimateDataCostOutputSchema),

    getPrices: oc
      .route({
        path: '/utils/prices',
        method: 'POST',
        summary: 'Get the current Ethereum and gas prices in Wei, ETH and USD',
        tags: ['utils'],
      })
      .input(GetPricesInputSchema)
      .output(GetPricesOutputSchema),

    resolveUser: oc
      .route({
        path: '/resolve/{user}',
        method: 'GET',
        summary: 'Resolve a user by address, ENS name, or Ethscription Name',
        tags: ['utils'],
      })
      .input(ResolveUserInputSchema)
      .output(ResolveUserOutputSchema),
  },
};

export type Inputs = InferContractRouterInputs<typeof contract>;
export type Outputs = InferContractRouterOutputs<typeof contract>;
