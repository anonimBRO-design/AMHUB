import type {
	DeviceSupport,
	PresetDifficulty,
	PresetFileType,
	SortField,
	SortOrder,
} from "@presethub/types";
import { z } from "zod";
import { stringToIntSchema } from "./validation";

const slugSchema = z
	.string()
	.trim()
	.min(2)
	.max(100)
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const textArraySchema = z.array(z.string().trim().min(1).max(40)).max(10);

const presetFileTypeSchema = z.enum(["xml", "qr", "link"]) satisfies z.ZodType<
	PresetFileType,
	z.ZodTypeDef,
	PresetFileType
>;

const presetDifficultySchema = z.enum([
	"beginner",
	"intermediate",
	"advanced",
]) satisfies z.ZodType<PresetDifficulty, z.ZodTypeDef, PresetDifficulty>;

const deviceSupportSchema = z.enum([
	"android",
	"ios",
	"both",
]) satisfies z.ZodType<DeviceSupport, z.ZodTypeDef, DeviceSupport>;

const sortFieldSchema = z.enum([
	"created_at",
	"download_count",
	"like_count",
	"view_count",
	"title",
]) satisfies z.ZodType<SortField, z.ZodTypeDef, SortField>;

const sortOrderSchema = z.enum(["asc", "desc"]) satisfies z.ZodType<
	SortOrder,
	z.ZodTypeDef,
	SortOrder
>;

export const presetIdParamsSchema = z.object({
	id: z.string().uuid(),
});

export const listPresetsQuerySchema = z.object({
	page: stringToIntSchema.default("1").pipe(z.number().int().min(1)),
	limit: stringToIntSchema.default("24").pipe(z.number().int().min(1).max(100)),
	sort: sortFieldSchema.default("created_at"),
	order: sortOrderSchema.default("desc"),
	search: z.string().trim().min(1).max(120).optional(),
	category: z.string().trim().min(2).max(40).optional(),
	fileType: presetFileTypeSchema.optional(),
	tags: z
		.union([z.string().trim().min(1), z.array(z.string().trim().min(1))])
		.transform((value) => (Array.isArray(value) ? value : value.split(",")))
		.pipe(textArraySchema)
		.optional(),
});

const presetFileLocationSchema = z
	.object({
		file_type: presetFileTypeSchema,
		file_url: z.string().url().nullable().optional(),
		am_link: z.string().url().nullable().optional(),
	})
	.superRefine((value, context) => {
		if (value.file_type === "link") {
			if (!value.am_link) {
				context.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["am_link"],
					message: "Alight Motion link is required for link presets.",
				});
			}

			if (value.file_url) {
				context.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["file_url"],
					message: "File URL is not allowed for link presets.",
				});
			}

			return;
		}

		if (!value.file_url) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["file_url"],
				message: "File URL is required for uploaded preset files.",
			});
		}

		if (value.am_link) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["am_link"],
				message: "Alight Motion link is only allowed for link presets.",
			});
		}
	});

const presetWriteBaseSchema = z.object({
	slug: slugSchema,
	title: z.string().trim().min(1).max(100),
	description: z.string().trim().max(2000).nullable().optional(),
	thumbnail_url: z.string().url(),
	preview_video_url: z.string().url().nullable().optional(),
	category: z.string().trim().min(2).max(40),
	style: textArraySchema.default([]),
	tags: textArraySchema.default([]),
	difficulty: presetDifficultySchema.default("beginner"),
	am_version_min: z.string().trim().min(1).max(40).nullable().optional(),
	am_version_max: z.string().trim().min(1).max(40).nullable().optional(),
	device_support: z.array(deviceSupportSchema).min(1).max(3).default(["both"]),
});

export const createPresetSchema = presetWriteBaseSchema.and(
	presetFileLocationSchema,
);

export const updatePresetSchema = presetWriteBaseSchema
	.partial()
	.extend({
		file_type: presetFileTypeSchema.optional(),
		file_url: z.string().url().nullable().optional(),
		am_link: z.string().url().nullable().optional(),
	})
	.superRefine((value, context) => {
		if (!value.file_type) {
			return;
		}

		const result = presetFileLocationSchema.safeParse({
			file_type: value.file_type,
			file_url: value.file_url,
			am_link: value.am_link,
		});

		if (!result.success) {
			for (const issue of result.error.issues) {
				context.addIssue(issue);
			}
		}
	});

export type ListPresetsQuery = z.infer<typeof listPresetsQuerySchema>;
export type CreatePresetInput = z.infer<typeof createPresetSchema>;
export type UpdatePresetInput = z.infer<typeof updatePresetSchema>;
