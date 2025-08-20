// SPDX-License-Identifier: MPL-2.0

import { ORPCError, os, safe } from "@orpc/server";
// Import original utilities until they are converted
import {
	bytesToHex,
	createDigest,
	hexToBytes,
	isHexValue,
} from "../../../src/utils.ts";
import {
	GetDigestForDataInputSchema,
	GetDigestForDataOutputSchema,
} from "../schemas/digest.ts";
import { multiCheckExistsProcedure } from "./check-exists.ts";

export const getDigestForDataProcedure = os
	.input(GetDigestForDataInputSchema)
	.output(GetDigestForDataOutputSchema)
	.handler(async ({ input }) => {
		const isUint8 = input.input instanceof Uint8Array;
		const isRawData = isUint8
			? false
			: typeof input.input === "string" && input.input.startsWith("data:");
		const isHexData = isUint8
			? false
			: typeof input.input === "string" &&
				isHexValue(input.input.replace(/^0x/, "")) &&
				input.input.replace(/^0x/, "").startsWith("646174613a");

		const isValid = [isUint8, isRawData, isHexData].includes(true);

		if (!isValid) {
			throw new ORPCError("BAD_REQUEST", {
				message:
					"Invalid data, must be a data URI, as Uint8Array encoded data URI, or hex encoded dataURI string",
				status: 400,
			});
		}

		try {
			// Handle different input types and convert to Uint8Array
			let data: Uint8Array;

			if (isRawData) {
				data = new TextEncoder().encode(input.input as string);
			} else if (isHexData) {
				data = hexToBytes((input.input as string).replace(/^0x/, ""));
			} else if (isUint8) {
				// Deserialize from hex string back to Uint8Array
				// const hexData = (input.input as string).replace('uint8array:', '');
				data = input.input as Uint8Array;
			} else {
				// Fallback for regular string
				data = new TextEncoder().encode(input.input as string);
			}

			const sha = await createDigest(data);
			const hexed = bytesToHex(data);
			const inputData = new TextDecoder("utf-8").decode(data);

			if (input.expand === true && input.checkExists === false) {
				console.info(
					`Expanding only works when you set "checkExists: true" too`,
				);
			}

			if (input.checkExists) {
				const existsResult = await safe(
					multiCheckExistsProcedure.callable()({
						...input,
						shas: sha,
					}),
				);

				if (existsResult.error) {
					return {
						sha: `0x${sha}`,
						hex: `0x${hexed}`,
						...(input.includeInput ? { input: inputData } : {}),
						exists: { [`0x${sha}`]: null },
					};
				}

				return {
					sha: `0x${sha}`,
					hex: `0x${hexed}`,
					...(input.includeInput ? { input: inputData } : {}),
					exists: existsResult.data,
				};
			}

			return {
				sha: `0x${sha}`,
				hex: `0x${hexed}`,
				...(input.includeInput ? { input: inputData } : {}),
			};
		} catch (err: any) {
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: `Failure in SHA generation: ${err.toString()}`,
				status: 500,
			});
		}
	});
