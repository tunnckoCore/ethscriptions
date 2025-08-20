// SPDX-License-Identifier: MPL-2.0

import type { z } from "zod";
import {
	BaseQuerySchema,
	BooleanSchema,
	CheckExistResultSchema,
	DataInputSchema,
	DigestResultSchema,
} from "../schemas/index.ts";

// Input schema for getDigestForData procedure
export const GetDigestForDataInputSchema = BaseQuerySchema.extend({
	input: DataInputSchema,
	checkExists: BooleanSchema.default(false),
	includeInput: BooleanSchema.default(false),
});

// Output schema - union type based on checkExists flag
export const GetDigestForDataOutputSchema = DigestResultSchema.extend({
	exists: CheckExistResultSchema.optional(),
});

// Types for convenience
export type GetDigestForDataInput = z.infer<typeof GetDigestForDataInputSchema>;
export type GetDigestForDataOutput = z.infer<
	typeof GetDigestForDataOutputSchema
>;
