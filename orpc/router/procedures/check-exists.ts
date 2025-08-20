// SPDX-License-Identifier: MPL-2.0

import { ORPCError, os, safe } from "@orpc/server";

import {
	MultiCheckExistsInputSchema,
	MultiCheckExistsOutputSchema,
} from "../schemas/check-exists.ts";
import { getDigestForDataProcedure } from "./digest.ts";
import { getEthscriptionDetailedProcedure } from "./ethscription-detailed.ts";

export const multiCheckExistsProcedure = os
	.input(MultiCheckExistsInputSchema)
	.output(MultiCheckExistsOutputSchema)
	.handler(async ({ input }) => {
		const { inputs = [], shas = [], ...options } = input;

		const dataShas = (
			await Promise.all(
				inputs.map((inputData) =>
					safe(getDigestForDataProcedure.callable()({ input: inputData })),
				),
			)
		).flatMap((x) => (x.error ? [] : x.data.sha));

		// Process shas into normalized hash list
		const shaList =
			dataShas.length > 0
				? dataShas
				: (typeof shas === "string" ? [shas] : shas)
						.filter(Boolean)
						.flatMap((x) =>
							x
								.replace("0x", "")
								.match(/[0-9a-fA-F]{64}/g)
								?.map((z: string) => z?.replace("0x", "")),
						)
						.filter(Boolean);

		if (shaList.length === 0) {
			throw new ORPCError("BAD_REQUEST", {
				message: "No valid SHA-256 hashes provided",
				status: 400,
			});
		}

		if (shaList.length > 100) {
			throw new ORPCError("BAD_REQUEST", {
				message: "Too many hashes provided",
				status: 400,
			});
		}

		let resp: any;
		try {
			resp = await fetch(`${options.baseURL}/ethscriptions/exists_multi`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					shas: shaList.map((x) => `0x${(x || "").replace(/^0x/, "")}`),
				}),
			}).then((x) => x.json());
		} catch (err: any) {
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to fetch from upstream API",
				status: 500,
				cause: err,
			});
		}

		const hasFound =
			Object.values(resp.result || {}).filter(Boolean).length > 0;

		if (!hasFound) {
			throw new ORPCError("NOT_FOUND", {
				message: "No ethscriptions found",
				status: 404,
			});
		}

		// Handle expansion if requested
		if (options.expand) {
			const expanded = await Promise.all(
				Object.entries(resp.result).map(async ([sha, id = ""]) => {
					if (!id) {
						return [sha, null];
					}

					const detailedResult = await safe(
						getEthscriptionDetailedProcedure.callable()({
							...options,
							id: id as string,
							mode: "meta",
						}),
					);

					if (detailedResult.error) {
						// console.log('check-exists error on detailed', detailedResult.error);
						return [sha, id];
					}

					return [sha, detailedResult.data];
				}),
			);

			return Object.fromEntries(expanded);
		}

		return resp.result;
	});
