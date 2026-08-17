"use client";

import { resolveStorageUrl } from "@/lib/supabase/storage-url";
import type {
	PresetSourceFormat,
	PresetSourceType,
	ValidationResult,
} from "@/lib/validation/types";
import type { PresetFileType } from "@presethub/types";
import {
	AlertCircle,
	ArrowLeft,
	ArrowRight,
	Loader2,
	Sparkles,
	Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { type FormEvent, useState } from "react";
import { DetailsStep } from "./DetailsStep";
import { FilePicker } from "./FilePicker";
import { PreviewVideoStep } from "./PreviewVideoStep";
import { ReviewStep } from "./ReviewStep";
import { ThumbnailStep } from "./ThumbnailStep";
import { WizardProgress } from "./WizardProgress";

const WIZARD_STEPS = [
	{ num: 1, label: "Format & File" },
	{ num: 2, label: "Thumbnail" },
	{ num: 3, label: "Preview Video" },
	{ num: 4, label: "Preset Details" },
	{ num: 5, label: "Review & Publish" },
];

export function UploadWizard() {
	const router = useRouter();
	const [currentStep, setCurrentStep] = useState(1);
	const [isLoading, setIsLoading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [error, setError] = useState<string | null>(null);

	// Multi-Select Preset Sources State
	const [selectedFileTypes, setSelectedFileTypes] = useState<
		PresetSourceFormat[]
	>(["xml"]);

	// Form State
	const [presetFile, setPresetFile] = useState<File | null>(null);
	const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
	const [previewVideoFile, setPreviewVideoFile] = useState<File | null>(null);
	const [amLink, setAmLink] = useState("");
	const [gdriveLink, setGdriveLink] = useState("");
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [category, setCategory] = useState("velocity");
	const [difficulty, setDifficulty] = useState<
		"beginner" | "intermediate" | "advanced"
	>("intermediate");
	const [isPaid, setIsPaid] = useState(false);
	const [price, setPrice] = useState(0);

	// Real-time Validation State
	const [validation, setValidation] = useState<ValidationResult>({
		isValid: false,
		isValidating: false,
		checks: [],
		error: null,
	});

	const isNextStepDisabled = () => {
		if (currentStep === 1) {
			return (
				!validation.isValid ||
				validation.isValidating ||
				selectedFileTypes.length === 0
			);
		}
		if (currentStep === 2) {
			return !thumbnailFile;
		}
		if (currentStep === 4) {
			return !title.trim() || (isPaid && (price < 1000 || Number.isNaN(price)));
		}
		return false;
	};

	const handleNextStep = () => {
		setError(null);
		if (currentStep === 1) {
			if (selectedFileTypes.length === 0) {
				setError("Please select at least one preset source.");
				return;
			}
			if (!validation.isValid) {
				setError(
					validation.error ||
						"Please complete asset validation for all selected sources.",
				);
				return;
			}
			setCurrentStep(2);
		} else if (currentStep === 2) {
			if (!thumbnailFile) {
				setError("Please upload a thumbnail preview image.");
				return;
			}
			setCurrentStep(3);
		} else if (currentStep === 3) {
			setCurrentStep(4);
		} else if (currentStep === 4) {
			if (!title.trim()) {
				setError("Title is required.");
				return;
			}
			if (isPaid && (price < 1000 || Number.isNaN(price))) {
				setError("Harga preset berbayar minimal Rp 1.000.");
				return;
			}
			setCurrentStep(5);
		}
	};

	const handlePrevStep = () => {
		setError(null);
		if (currentStep > 1) {
			setCurrentStep((prev) => prev - 1);
		}
	};

	const uploadFile = async (
		file: File,
		upload_type: "xml" | "thumbnail" | "presetVideo",
		content_type: string,
	): Promise<string> => {
		const fileLabel =
			upload_type === "thumbnail"
				? "Thumbnail"
				: upload_type === "presetVideo"
					? "Preview video"
					: "Preset XML";

		console.log(
			`[UPLOAD] type=${upload_type} filename=${file.name} size=${file.size} contentType=${content_type}`,
		);

		const res = await fetch("/api/uploads/preset", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				upload_type,
				filename: file.name,
				content_type,
				size: file.size,
			}),
		});

		const json = await res.json();
		if (!res.ok) {
			const errMsg =
				json.error?.message ||
				json.message ||
				`Failed to prepare ${fileLabel.toLowerCase()} upload`;
			console.error(
				`[UPLOAD ERROR] type=${upload_type} prepare failed (HTTP ${res.status}):`,
				json,
			);
			throw new Error(`${fileLabel} upload preparation failed: ${errMsg}`);
		}

		console.log(
			`[UPLOAD] type=${upload_type} signed URL received. Uploading to bucket=${json.data.bucket}...`,
		);

		await new Promise<void>((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.open("PUT", json.data.upload_url);
			xhr.setRequestHeader("Content-Type", content_type);
			xhr.upload.onprogress = (event) => {
				if (event.lengthComputable) {
					setUploadProgress(Math.round((event.loaded / event.total) * 100));
				}
			};
			xhr.onload = () => {
				if (xhr.status >= 200 && xhr.status < 300) {
					console.log(
						`[UPLOAD SUCCESS] type=${upload_type} storage_path=${json.data.storage_path}`,
					);
					resolve();
				} else {
					console.error(
						`[UPLOAD ERROR] type=${upload_type} storage PUT failed (HTTP ${xhr.status}):`,
						xhr.responseText,
					);
					reject(
						new Error(
							`${fileLabel} upload failed (HTTP ${xhr.status}): ${
								xhr.statusText || "Storage upload rejected"
							}`,
						),
					);
				}
			};
			xhr.onerror = () => {
				console.error(
					`[UPLOAD ERROR] type=${upload_type} network error during storage PUT`,
				);
				reject(
					new Error(
						`${fileLabel} upload failed due to network connection issue.`,
					),
				);
			};
			xhr.send(file);
		});

		return json.data.storage_path;
	};

	// Map Zod + ApiError details into user-friendly strings
	const mapValidationError = (err: any): string => {
		if (!err) return "An unexpected error occurred.";

		if (typeof err.message === "string" && err.message.trim().length > 0) {
			// Specific asset upload errors
			if (
				err.message.includes("upload preparation failed") ||
				err.message.includes("upload failed") ||
				err.message.includes("too large") ||
				err.message.startsWith("Thumbnail") ||
				err.message.startsWith("Preview video") ||
				err.message.startsWith("Preset XML") ||
				err.message.startsWith("AM Link") ||
				err.message.startsWith("Google Drive") ||
				err.message.startsWith("Validation Error")
			) {
				return err.message;
			}
		}

		// Zod unprocessable_entity (422)
		if (err.code === "unprocessable_entity" && err.details) {
			const msgs = (err.details as any[]).map((d: any) => {
				const path = d.path?.join(".") || "field";
				const msg = d.message;
				switch (path) {
					case "slug":
						return "Title generated an invalid slug. Try a different title.";
					case "title":
						return msg.includes("max")
							? "Title is too long (max 100 chars)."
							: "Title is required.";
					case "description":
						return "Description is too long (max 2000 chars).";
					case "thumbnail_url":
						return "Thumbnail upload failed: Invalid or missing thumbnail URL.";
					case "preview_video_url":
						return "Preview video upload failed: Invalid video URL.";
					case "file_type":
						return "Unsupported preset source type.";
					case "file_url":
						return "Preset XML upload failed: Invalid preset file reference.";
					case "am_link":
						return "External preset link is invalid or missing.";
					case "category":
						return "Category is required and must exist in the database.";
					case "difficulty":
						return "Difficulty must be beginner, intermediate, or advanced.";
					default:
						return `${path}: ${msg}`;
				}
			});
			return msgs.join(" • ");
		}

		// Supabase FK violations (category not found)
		if (err.message?.includes("presets_category_fkey")) {
			return "Selected category doesn't exist in the database. Please choose a valid category.";
		}

		// DB constraint: file_type check
		if (err.message?.includes("presets_file_type_check")) {
			return "Unsupported preset source type. Please check your link type.";
		}

		// DB constraint: file_location_check
		if (err.message?.includes("presets_file_location_check")) {
			return "Preset source error: Please provide at least one valid preset source file or link.";
		}

		// Rate limit
		if (err.code === "rate_limited" || err.message?.includes("rate limit")) {
			return "Too many uploads. Please wait a moment and try again.";
		}

		return err.message || "Failed to publish preset. Please try again.";
	};

	const handlePublish = async (e: FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setUploadProgress(0);
		setError(null);

		try {
			if (selectedFileTypes.length === 0) {
				throw new Error("Please select at least one preset source.");
			}

			let uploadedThumbnailUrl: string | undefined = undefined;
			let uploadedPreviewVideoUrl: string | undefined = undefined;
			let finalFileUrl: string | undefined = undefined;
			let amLinkValue: string | undefined = undefined;
			let gdriveLinkValue: string | undefined = undefined;

			// 1. Upload thumbnail
			if (thumbnailFile) {
				uploadedThumbnailUrl = await uploadFile(
					thumbnailFile,
					"thumbnail",
					thumbnailFile.type || "image/jpeg",
				);
			}

			const getSafeVideoMimeType = (file: File): string => {
				if (file.type?.startsWith("video/")) {
					return file.type;
				}
				const ext = file.name.split(".").pop()?.toLowerCase();
				switch (ext) {
					case "mp4":
						return "video/mp4";
					case "webm":
						return "video/webm";
					case "mov":
						return "video/quicktime";
					case "m4v":
						return "video/x-m4v";
					case "mkv":
						return "video/x-matroska";
					default:
						return file.type || "video/mp4";
				}
			};

			// 2. Upload preview video
			if (previewVideoFile) {
				if (previewVideoFile.size > 50 * 1024 * 1024) {
					throw new Error(
						"Preview video is too large (maximum size is 50 MB).",
					);
				}
				const videoContentType = getSafeVideoMimeType(previewVideoFile);
				uploadedPreviewVideoUrl = await uploadFile(
					previewVideoFile,
					"presetVideo",
					videoContentType,
				);
			}

			// 3. Process selected preset sources independently
			if (selectedFileTypes.includes("xml")) {
				if (presetFile) {
					finalFileUrl = await uploadFile(
						presetFile,
						"xml",
						presetFile.type || "text/xml",
					);
				}
			}

			if (selectedFileTypes.includes("link")) {
				amLinkValue = amLink.trim() || undefined;
			}

			if (selectedFileTypes.includes("gdrive")) {
				gdriveLinkValue = gdriveLink.trim() || undefined;
			}

			// Combine external links if multiple link sources selected
			let combinedAmLink: string | undefined = undefined;
			if (amLinkValue && gdriveLinkValue) {
				combinedAmLink = `${amLinkValue} | ${gdriveLinkValue}`;
			} else if (amLinkValue) {
				combinedAmLink = amLinkValue;
			} else if (gdriveLinkValue) {
				combinedAmLink = gdriveLinkValue;
			}

			// Determine primary file_type for database compatibility ('xml' or 'link')
			let primaryFileType: PresetFileType = "xml";
			if (selectedFileTypes.includes("xml")) {
				primaryFileType = "xml";
			} else {
				primaryFileType = "link";
			}

			const fileTypesPayload = selectedFileTypes.map((t) =>
				t === "xml"
					? "xml"
					: t === "gdrive"
						? "google_drive"
						: "alight_creative",
			);

			// Resolve full public URLs or valid string paths for database
			const resolvedThumbnailUrl = uploadedThumbnailUrl
				? resolveStorageUrl(uploadedThumbnailUrl, "thumbnails") ||
					uploadedThumbnailUrl
				: "/placeholder.jpg";

			const resolvedPreviewVideoUrl = uploadedPreviewVideoUrl
				? resolveStorageUrl(uploadedPreviewVideoUrl, "preset-videos") ||
					uploadedPreviewVideoUrl
				: undefined;

			const resolvedFileUrl = finalFileUrl
				? resolveStorageUrl(finalFileUrl, "preset-files") || finalFileUrl
				: undefined;

			// 4. Create Preset record
			const slug = `${title
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/^-+|-+$/g, "")}-${Date.now().toString().slice(-4)}`;

			const createRes = await fetch("/api/presets", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					slug,
					title,
					description: description.trim() || undefined,
					thumbnail_url: resolvedThumbnailUrl,
					preview_video_url: resolvedPreviewVideoUrl,
					file_type: primaryFileType,
					file_types: fileTypesPayload,
					file_url: resolvedFileUrl,
					am_link: combinedAmLink,
					category,
					difficulty,
					is_paid: isPaid,
					price: isPaid ? price : 0,
					currency: "IDR",
				}),
			});

			const createJson = await createRes.json();
			if (!createRes.ok) {
				// Rollback uploaded files
				const cleanupPaths = [];
				if (uploadedThumbnailUrl)
					cleanupPaths.push({
						bucket: "thumbnails",
						path: uploadedThumbnailUrl,
					});
				if (uploadedPreviewVideoUrl)
					cleanupPaths.push({
						bucket: "preset-videos",
						path: uploadedPreviewVideoUrl,
					});
				if (finalFileUrl)
					cleanupPaths.push({ bucket: "preset-files", path: finalFileUrl });

				for (const item of cleanupPaths) {
					try {
						await fetch("/api/uploads/delete", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify(item),
						});
					} catch (cleanupErr) {
						console.error("Cleanup failed:", cleanupErr);
					}
				}

				if (
					createJson.error?.code === "unprocessable_entity" &&
					createJson.error.details
				) {
					const details = createJson.error.details as any[];
					const msg = details.map((d) => `${d.path}: ${d.message}`).join(", ");
					throw new Error(`Validation Error: ${msg}`);
				}

				throw new Error(createJson.error?.message || "Failed to create preset");
			}

			posthog.capture("preset_published", {
				preset_id: createJson.data?.id ?? createJson.id,
				file_type: primaryFileType,
				file_types: fileTypesPayload,
				category,
				difficulty,
				is_paid: isPaid,
				price: isPaid ? price : 0,
			});
			const destinationSlug = createJson.data?.slug ?? createJson.slug ?? slug;
			router.push(`/preset/${destinationSlug}`);
		} catch (err: unknown) {
			const apiError = err as {
				code?: string;
				message?: string;
				details?: any;
				stack?: string;
			};
			setError(mapValidationError(apiError));
			setIsLoading(false);
		}
	};

	return (
		<div className="max-w-2xl mx-auto space-y-6">
			{/* Header */}
			<div className="space-y-1 text-center sm:text-left">
				<div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-[var(--color-interactive-primary)] uppercase tracking-wider">
					<Sparkles className="w-4 h-4" />
					<span>Creator Studio</span>
				</div>
				<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
					Upload Alight Motion Preset
				</h1>
			</div>

			{/* Progress Indicator */}
			<WizardProgress
				currentStep={currentStep}
				totalSteps={WIZARD_STEPS.length}
				steps={WIZARD_STEPS}
			/>

			{/* Error Alert Banner */}
			{error && (
				<div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
					<AlertCircle className="w-5 h-5 shrink-0" />
					<p className="flex-1">{error}</p>
				</div>
			)}

			{/* Form Container */}
			<div className="p-6 sm:p-8 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-xl">
				{currentStep === 1 && (
					<FilePicker
						selectedFileTypes={selectedFileTypes}
						onSelectedFileTypesChange={setSelectedFileTypes}
						presetFile={presetFile}
						onPresetFileChange={setPresetFile}
						amLink={amLink}
						onAmLinkChange={(link) => setAmLink(link)}
						gdriveLink={gdriveLink}
						onGdriveLinkChange={setGdriveLink}
						validation={validation}
						onValidationChange={setValidation}
					/>
				)}

				{currentStep === 2 && (
					<ThumbnailStep
						thumbnailFile={thumbnailFile}
						onThumbnailFileChange={setThumbnailFile}
					/>
				)}

				{currentStep === 3 && (
					<PreviewVideoStep
						previewVideoFile={previewVideoFile}
						onPreviewVideoFileChange={setPreviewVideoFile}
						thumbnailFile={thumbnailFile}
					/>
				)}

				{currentStep === 4 && (
					<DetailsStep
						title={title}
						onTitleChange={setTitle}
						description={description}
						onDescriptionChange={setDescription}
						category={category}
						onCategoryChange={setCategory}
						difficulty={difficulty}
						onDifficultyChange={setDifficulty}
						isPaid={isPaid}
						onIsPaidChange={setIsPaid}
						price={price}
						onPriceChange={setPrice}
					/>
				)}

				{currentStep === 5 && (
					<ReviewStep
						title={title}
						description={description}
						category={category}
						difficulty={difficulty}
						selectedFileTypes={selectedFileTypes}
						presetFile={presetFile}
						thumbnailFile={thumbnailFile}
						amLink={amLink}
						gdriveLink={gdriveLink}
						previewVideoFile={previewVideoFile}
						isPaid={isPaid}
						price={isPaid ? price : 0}
					/>
				)}
			</div>

			{/* Navigation Buttons */}
			<div className="mt-8 mb-24 sm:mb-28 pt-4 border-t border-[var(--color-border-subtle)]/60">
				<div className="flex items-center justify-between gap-3 max-w-2xl mx-auto">
					{currentStep > 1 ? (
						<button
							type="button"
							onClick={handlePrevStep}
							disabled={isLoading}
							className="inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-2xl bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] font-bold text-xs border border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-elevated)] active:scale-95 transition-all disabled:opacity-50"
						>
							<ArrowLeft className="w-4 h-4" />
							<span>Back</span>
						</button>
					) : (
						<div />
					)}

					{currentStep < 5 ? (
						<button
							type="button"
							onClick={handleNextStep}
							disabled={isNextStepDisabled()}
							className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-2xl bg-[var(--color-interactive-primary)] text-white font-bold text-xs shadow-lg shadow-[var(--color-interactive-primary)]/20 hover:bg-[var(--color-interactive-primary-hover)] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed ml-auto"
						>
							<span>Next Step</span>
							<ArrowRight className="w-4 h-4" />
						</button>
					) : (
						<button
							type="button"
							onClick={handlePublish}
							disabled={isLoading}
							className="inline-flex items-center justify-center gap-2 min-h-[48px] px-8 rounded-2xl bg-gradient-to-r from-[var(--color-interactive-primary)] to-purple-600 text-white font-bold text-xs shadow-xl shadow-[var(--color-interactive-primary)]/30 hover:opacity-95 active:scale-95 transition-all disabled:opacity-50 ml-auto"
						>
							{isLoading ? (
								<>
									<Loader2 className="w-4 h-4 animate-spin" />
									<span>
										{uploadProgress > 0
											? `Uploading ${uploadProgress}%...`
											: "Publishing Preset..."}
									</span>
								</>
							) : (
								<>
									<Upload className="w-4 h-4" />
									<span>Publish Preset</span>
								</>
							)}
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
