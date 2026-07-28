import type { NextRequest } from "next/server";
import { z } from "zod";
import { ApiError, validationError } from "./errors";

export type AnyZodSchema = z.ZodTypeAny;
export type InferSchema<TSchema extends AnyZodSchema> = z.infer<TSchema>;

export async function validateJson<TSchema extends AnyZodSchema>(
	request: NextRequest | Request,
	schema: TSchema,
): Promise<InferSchema<TSchema>> {
	let body: unknown;

	try {
		body = await request.json();
	} catch (error) {
		throw new ApiError({
			code: "bad_request",
			message: "Request body contains invalid JSON.",
			cause: error,
		});
	}

	return parseWithSchema(schema, body);
}

export async function validateFormData<TSchema extends AnyZodSchema>(
	request: NextRequest | Request,
	schema: TSchema,
): Promise<InferSchema<TSchema>> {
	const formData = await request.formData();
	const values = formDataToObject(formData);

	return parseWithSchema(schema, values);
}

export function validateQuery<TSchema extends AnyZodSchema>(
	searchParams: URLSearchParams,
	schema: TSchema,
): InferSchema<TSchema> {
	return parseWithSchema(schema, searchParamsToObject(searchParams));
}

export function validateRouteParams<TSchema extends AnyZodSchema>(
	params: unknown,
	schema: TSchema,
): InferSchema<TSchema> {
	return parseWithSchema(schema, params);
}

export function parseWithSchema<TSchema extends AnyZodSchema>(
	schema: TSchema,
	value: unknown,
): InferSchema<TSchema> {
	const result = schema.safeParse(value);

	if (!result.success) {
		throw validationError(result.error);
	}

	return result.data;
}

export function searchParamsToObject(searchParams: URLSearchParams) {
	const values: Record<string, string | string[]> = {};

	for (const key of new Set(searchParams.keys())) {
		const allValues = searchParams.getAll(key);
		values[key] = allValues.length > 1 ? allValues : (allValues[0] ?? "");
	}

	return values;
}

export function formDataToObject(formData: FormData) {
	const values: Record<string, FormDataEntryValue | FormDataEntryValue[]> = {};

	for (const key of new Set(formData.keys())) {
		const allValues = formData.getAll(key);
		values[key] = allValues.length > 1 ? allValues : allValues[0];
	}

	return values;
}

export const stringToIntSchema = z
	.string()
	.trim()
	.regex(/^\d+$/)
	.transform((value) => Number.parseInt(value, 10));
