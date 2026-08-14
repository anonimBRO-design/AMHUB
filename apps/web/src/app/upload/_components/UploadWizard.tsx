"use client";

import type { ValidationResult, PresetSourceType } from "@/lib/validation/types";
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
import type { PresetFileType, Database } from "@presethub/types";

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

	// Form State
	const [fileType, setFileType] = useState<"xml" | "gdrive" | "link">("xml");
	const [presetFile, setPresetFile] = useState<File | null>(null);
	const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
	const [previewVideoFile, setPreviewVideoFile] = useState<File | null>(null);
	const [amLink, setAmLink] = useState("");
	const [gdriveLink, setGdriveLink] = useState("");
	const [amLinkSourceType, setAmLinkSourceType] = useState<PresetSourceType | null>("alight_creative");
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [category, setCategory] = useState("velocity");
	const [difficulty, setDifficulty] = useState<
		"beginner" | "intermediate" | "advanced"
	>("intermediate");

	// Real-time Validation State
	const [validation, setValidation] = useState<ValidationResult>({
		isValid: false,
		isValidating: false,
		checks: [],
		error: null,
	});

	const isNextStepDisabled = () => {
		if (currentStep === 1) {
			return !validation.isValid || validation.isValidating;
		}
		if (currentStep === 2) {
			return !thumbnailFile;
		}
		if (currentStep === 4) {
			return !title.trim();
		}
		return false;
	};

	const handleNextStep = () => {
		setError(null);
		if (currentStep === 1) {
			if (!validation.isValid) {
				setError(validation.error || "Please complete asset validation first.");
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
			throw new Error(
				json.error?.message || `Failed to prepare ${upload_type} upload`,
			);
		}

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
				if (xhr.status === 200) resolve();
				else reject(new Error("Upload failed"));
			};
			xhr.onerror = () => reject(new Error("Upload failed"));
			xhr.send(file);
		});

		return json.data.storage_path;
	};

	// Map Zod + ApiError details into user-friendly strings
	const mapValidationError = (err: any, fileType: PresetFileType): string => {
		if (!err) return "An unexpected error occurred.";

		// Zod unprocessable_entity (422)
		if (err.code === "unprocessable_entity" && err.details) {
			const msgs = (err.details as any[]).map((d: any) => {
				const path = d.path?.join(".") || "field";
				const msg = d.message;
				switch (path) {
					case "slug":
						return "Title generated an invalid slug. Try a different title.";
					case "title":
						return msg.includes("max") ? "Title is too long (max 100 chars)." : "Title is required.";
					case "description":
						return "Description is too long (max 2000 chars).";
					case "thumbnail_url":
						return "Thumbnail URL is invalid. Please re-upload.";
					case "preview_video_url":
						return "Preview video URL is invalid. Please re-upload.";
					case "file_type":
						return "Unsupported preset source type.";
					case "file_url":
						return "Preset file reference is missing or invalid.";
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
			if (fileType === "xml") {
				return "An uploaded XML preset file is required for this source type.";
			} else {
				return "An external preset link (Alight Link / Google Drive / Alight Creative) is required for this source type.";
			}
		}

		// Rate limit
		if (err.code === "rate_limited" || err.message?.includes("rate limit")) {
			return "Too many uploads. Please wait a moment and try again.";
		}

		// Storage errors
		if (err.message?.includes("storage")) {
			return "File upload failed. Please check the file and try again.";
		}

		return err.message || "Failed to publish preset. Please try again.";
	};

	const handlePublish = async (e: FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setUploadProgress(0);
		setError(null);

		let finalFileType: PresetFileType = fileType === "gdrive" ? "google_drive" : "xml";

		try {
			let uploadedThumbnailUrl: string | undefined = undefined;
			let uploadedPreviewVideoUrl: string | undefined = undefined;
			let finalFileUrl: string | undefined = undefined;
			let finalAmLink: string | undefined = undefined;

			// 1. Upload thumbnail
			if (thumbnailFile) {
				uploadedThumbnailUrl = await uploadFile(
					thumbnailFile,
					"thumbnail",
					thumbnailFile.type || "image/jpeg",
				);
			}

			// 2. Upload preview video
			if (previewVideoFile) {
				uploadedPreviewVideoUrl = await uploadFile(
					previewVideoFile,
					"presetVideo",
					previewVideoFile.type || "video/mp4",
				);
			}

			// 3. Handle preset source
			if (fileType === "xml") {
				finalFileType = "xml";
				if (presetFile) {
					finalFileUrl = await uploadFile(
						presetFile,
						"xml",
						presetFile.type || "text/xml",
					);
				}
			} else if (fileType === "gdrive") {
				finalFileType = "google_drive";
				finalAmLink = gdriveLink.trim() || undefined;
			} else if (fileType === "link") {
				finalAmLink = amLink.trim() || undefined;
				if (validation.sourceType && validation.sourceType !== "xml_file") {
					finalFileType = validation.sourceType as PresetFileType;
				} else {
					finalFileType = (amLinkSourceType as PresetFileType) || "link";
				}
			}

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
					thumbnail_url: uploadedThumbnailUrl ?? "/placeholder.jpg",
					preview_video_url: uploadedPreviewVideoUrl || undefined,
					file_type: finalFileType,
					file_url: finalFileUrl || undefined,
					am_link: finalAmLink || undefined,
					category,
					difficulty,
				}),
			});

			const createJson = await createRes.json();
			if (!createRes.ok) {
				// Rollback
				const cleanupPaths = [];
				if (uploadedThumbnailUrl) cleanupPaths.push({ bucket: "thumbnails", path: uploadedThumbnailUrl });
				if (uploadedPreviewVideoUrl) cleanupPaths.push({ bucket: "preset-videos", path: uploadedPreviewVideoUrl });
				if (finalFileUrl) cleanupPaths.push({ bucket: "preset-files", path: finalFileUrl });

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

				if (createJson.error?.code === "unprocessable_entity" && createJson.error.details) {
					const details = createJson.error.details as any[];
					const msg = details.map(d => `${d.path}: ${d.message}`).join(", ");
					throw new Error(`Validation Error: ${msg}`);
				}

				throw new Error(createJson.error?.message || "Failed to create preset");
			}

			posthog.capture("preset_published", {
				preset_id: createJson.data?.id ?? createJson.id,
				file_type: finalFileType,
				category,
				difficulty,
			});
			router.push(`/preset/${slug}`);
		} catch (err: unknown) {
			const apiError = err as { code?: string; message?: string; details?: any; stack?: string };
			setError(mapValidationError(apiError, finalFileType));
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
						fileType={fileType}
						onFileTypeChange={setFileType}
						presetFile={presetFile}
						onPresetFileChange={setPresetFile}
						amLink={amLink}
						onAmLinkChange={(link, type) => {
							setAmLink(link);
							if (type) setAmLinkSourceType(type);
						}}
						gdriveLink={gdriveLink}
						onGdriveLinkChange={setGdriveLink}
						validation={validation}
						onValidationChange={setValidation}
						amLinkSourceType={amLinkSourceType}
						onAmLinkSourceTypeChange={setAmLinkSourceType}
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
					/>
				)}

				{currentStep === 5 && (
					<ReviewStep
						title={title}
						description={description}
						category={category}
						difficulty={difficulty}
						fileType={fileType}
						presetFile={presetFile}
						thumbnailFile={thumbnailFile}
						amLink={amLink}
						gdriveLink={gdriveLink}
						previewVideoFile={previewVideoFile}
						amLinkSourceType={amLinkSourceType}
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
