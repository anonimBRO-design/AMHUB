"use client";

import { formatAmVersion, normalizeAmVersion } from "@/lib/am-version";
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
import { GrowthStep } from "./GrowthStep";
import { PreviewVideoStep } from "./PreviewVideoStep";
import { ReviewStep } from "./ReviewStep";
import { WizardProgress } from "./WizardProgress";

const WIZARD_STEPS = [
	{ num: 1, label: "Format & File" },
	{ num: 2, label: "Preview Video" },
	{ num: 3, label: "Preset Details" },
	{ num: 4, label: "Growth & Booster" },
	{ num: 5, label: "Review & Publish" },
];

async function extractThumbnailFromVideo(
	videoFile: File,
): Promise<File | null> {
	return new Promise((resolve) => {
		try {
			const video = document.createElement("video");
			video.preload = "metadata";
			video.muted = true;
			video.playsInline = true;
			const objectUrl = URL.createObjectURL(videoFile);
			video.src = objectUrl;

			const cleanUp = () => {
				URL.revokeObjectURL(objectUrl);
				video.remove();
			};

			video.onloadeddata = () => {
				video.currentTime = Math.min(
					0.5,
					Math.max(0.1, (video.duration || 1) * 0.1),
				);
			};

			video.onseeked = () => {
				try {
					const canvas = document.createElement("canvas");
					canvas.width = video.videoWidth || 720;
					canvas.height = video.videoHeight || 1280;
					const ctx = canvas.getContext("2d");
					if (ctx) {
						ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
						canvas.toBlob(
							(blob) => {
								cleanUp();
								if (blob) {
									const thumbFile = new File([blob], "thumbnail.jpg", {
										type: "image/jpeg",
									});
									resolve(thumbFile);
								} else {
									resolve(null);
								}
							},
							"image/jpeg",
							0.85,
						);
					} else {
						cleanUp();
						resolve(null);
					}
				} catch {
					cleanUp();
					resolve(null);
				}
			};

			video.onerror = () => {
				cleanUp();
				resolve(null);
			};
		} catch {
			resolve(null);
		}
	});
}

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
	const [previewVideoFile, setPreviewVideoFile] = useState<File | null>(null);
	const [amLink, setAmLink] = useState("");
	const [gdriveLink, setGdriveLink] = useState("");
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [category, setCategory] = useState("jj-tipis");
	const [difficulty, setDifficulty] = useState<
		"beginner" | "intermediate" | "advanced"
	>("intermediate");
	const [isPaid, setIsPaid] = useState(false);
	const [price, setPrice] = useState(0);
	const [commercialPrice, setCommercialPrice] = useState(0);
	const [amVersionMin, setAmVersionMin] = useState("");
	const [amVersionMax, setAmVersionMax] = useState("");
	const [remixFrom, setRemixFrom] = useState("");
	const [enableSocialLock, setEnableSocialLock] = useState(false);
	const [hasReviewedStep4, setHasReviewedStep4] = useState(false);
	const [tiktokSoundTitle, setTiktokSoundTitle] = useState("");
	const [tiktokSoundUrl, setTiktokSoundUrl] = useState("");
	const [sultanPackUrl, setSultanPackUrl] = useState("");

	const isAmVersionRangeValid = () => {
		const normalizedMin = normalizeAmVersion(amVersionMin);
		const normalizedMax = normalizeAmVersion(amVersionMax);
		if (amVersionMin.trim() && !normalizedMin) return false;
		if (amVersionMax.trim() && !normalizedMax) return false;
		if (normalizedMin && normalizedMax && normalizedMax < normalizedMin)
			return false;
		return true;
	};

	// Real-time Validation State
	const [validation, setValidation] = useState<ValidationResult>({
		isValid: false,
		isValidating: false,
		checks: [],
		error: null,
	});

	// Comprehensive validation across all steps - triggered only on final publish
	const validateAllSteps = (): {
		valid: boolean;
		targetStep: number;
		error: string;
	} => {
		// 1. Check Step 1: Format & File
		if (selectedFileTypes.length === 0) {
			return {
				valid: false,
				targetStep: 1,
				error:
					"Pilih minimal satu format sumber preset di Step 1 (XML File, AM Link, atau Google Drive).",
			};
		}
		if (selectedFileTypes.includes("xml") && !presetFile) {
			return {
				valid: false,
				targetStep: 1,
				error:
					"File XML Alight Motion belum di-upload di Step 1. Silakan pilih atau drag & drop file XML kamu.",
			};
		}
		if (selectedFileTypes.includes("link") && !amLink.trim()) {
			return {
				valid: false,
				targetStep: 1,
				error:
					"Tautan Alight Motion (AM Link) belum diisi di Step 1. Silakan masukkan link Alight Creative kamu.",
			};
		}
		if (selectedFileTypes.includes("gdrive") && !gdriveLink.trim()) {
			return {
				valid: false,
				targetStep: 1,
				error:
					"Link Google Drive belum diisi di Step 1. Silakan masukkan link Google Drive XML kamu.",
			};
		}
		if (!validation.isValid) {
			return {
				valid: false,
				targetStep: 1,
				error:
					validation.error ||
					"Validasi file atau tautan preset di Step 1 belum lengkap atau belum valid.",
			};
		}

		// 2. Check Step 2: Preview Video (WAJIB)
		if (!previewVideoFile) {
			return {
				valid: false,
				targetStep: 2,
				error:
					"Preview video wajib di-upload di Step 2! Silakan upload file video preview preset Alight Motion kamu.",
			};
		}

		// 3. Check Step 3: Preset Details
		if (!title.trim()) {
			return {
				valid: false,
				targetStep: 3,
				error: "Judul preset wajib diisi di Step 3!",
			};
		}
		if (isPaid && (price < 1000 || Number.isNaN(price))) {
			return {
				valid: false,
				targetStep: 3,
				error: "Harga preset berbayar minimal Rp 1.000 di Step 3!",
			};
		}
		if (
			isPaid &&
			commercialPrice > 0 &&
			(commercialPrice < price || Number.isNaN(commercialPrice))
		) {
			return {
				valid: false,
				targetStep: 3,
				error:
					"Harga lisensi komersial harus lebih besar atau sama dengan harga personal di Step 3!",
			};
		}
		if (!isAmVersionRangeValid()) {
			return {
				valid: false,
				targetStep: 3,
				error:
					"Format versi Alight Motion tidak valid di Step 3 (contoh: 5.0.5)!",
			};
		}

		return { valid: true, targetStep: 5, error: "" };
	};

	const isStep1Valid = Boolean(
		selectedFileTypes.length > 0 &&
			validation.isValid &&
			(!selectedFileTypes.includes("xml") || presetFile) &&
			(!selectedFileTypes.includes("link") || amLink.trim()) &&
			(!selectedFileTypes.includes("gdrive") || gdriveLink.trim()),
	);

	const isStep2Valid = Boolean(previewVideoFile);

	const isStep3Valid = Boolean(
		title.trim().length > 0 &&
			isAmVersionRangeValid() &&
			(!isPaid ||
				(price >= 1000 &&
					!Number.isNaN(price) &&
					(commercialPrice === 0 ||
						(commercialPrice >= price && !Number.isNaN(commercialPrice))))),
	);

	const hasBoosterConfigured = Boolean(
		enableSocialLock ||
			tiktokSoundTitle.trim() ||
			tiktokSoundUrl.trim() ||
			sultanPackUrl.trim(),
	);

	const isStep4Valid = hasBoosterConfigured || hasReviewedStep4;

	const isStep5Valid =
		isStep1Valid && isStep2Valid && isStep3Valid && currentStep === 5;

	const handleNextStep = () => {
		setError(null);
		if (currentStep === 4) {
			setHasReviewedStep4(true);
		}
		if (currentStep < 5) {
			setCurrentStep((prev) => prev + 1);
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
		setError(null);

		// Comprehensive check: If anything is incomplete, navigate back to that step and show notification
		const check = validateAllSteps();
		if (!check.valid) {
			setCurrentStep(check.targetStep);
			setError(check.error);
			setIsLoading(false);
			if (typeof window !== "undefined") {
				window.scrollTo({ top: 0, behavior: "smooth" });
			}
			return;
		}

		setIsLoading(true);
		setUploadProgress(0);

		try {
			let uploadedThumbnailUrl: string | undefined = undefined;
			let uploadedPreviewVideoUrl: string | undefined = undefined;
			let finalFileUrl: string | undefined = undefined;
			let amLinkValue: string | undefined = undefined;
			let gdriveLinkValue: string | undefined = undefined;

			// 1. Auto-extract and upload thumbnail from preview video if provided
			if (previewVideoFile) {
				try {
					const generatedThumb =
						await extractThumbnailFromVideo(previewVideoFile);
					if (generatedThumb) {
						uploadedThumbnailUrl = await uploadFile(
							generatedThumb,
							"thumbnail",
							"image/jpeg",
						);
					}
				} catch (e) {
					console.warn("Could not auto-generate thumbnail from video:", e);
				}
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

			// 4. Build rich description embedding sound & sultan pack tags
			let finalDescription = description.trim();
			const extraNotes: string[] = [];

			if (tiktokSoundTitle.trim()) {
				extraNotes.push(`🎵 Sound: ${tiktokSoundTitle.trim()}`);
			}
			if (tiktokSoundUrl.trim()) {
				extraNotes.push(`🔗 TikTok Sound: ${tiktokSoundUrl.trim()}`);
			}
			if (sultanPackUrl.trim()) {
				extraNotes.push(`💎 Paket Sultan: ${sultanPackUrl.trim()}`);
			}
			if (!enableSocialLock && !isPaid) {
				extraNotes.push(`<!-- amhub:no-social-lock -->`);
			}

			if (extraNotes.length > 0) {
				finalDescription = finalDescription
					? `${finalDescription}\n\n${extraNotes.join("\n")}`
					: extraNotes.join("\n");
			}

			const tagsPayload: string[] = [];
			if (!enableSocialLock && !isPaid) {
				tagsPayload.push("no-social-lock");
			}

			// Create Preset record
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
					description: finalDescription || undefined,
					tags: tagsPayload,
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
					commercial_price:
						isPaid && commercialPrice >= price ? commercialPrice : 0,
					am_version_min: normalizeAmVersion(amVersionMin) ?? undefined,
					am_version_max: normalizeAmVersion(amVersionMax) ?? undefined,
					remixed_from: remixFrom.trim() || undefined,
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
						console.error("Cleanup error for", item, cleanupErr);
					}
				}

				throw new Error(
					createJson.error?.message ||
						createJson.message ||
						"Failed to save preset to database.",
				);
			}

			// Analytics
			posthog.capture("preset_uploaded", {
				file_type: primaryFileType,
				category,
				difficulty,
				is_paid: isPaid,
				price: isPaid ? price : 0,
				has_preview_video: Boolean(previewVideoFile),
			});

			// Navigate to preset detail page
			router.push(`/preset/${createJson.data.slug}`);
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
				completedSteps={{
					1: isStep1Valid,
					2: isStep2Valid,
					3: isStep3Valid,
					4: isStep4Valid,
					5: isStep5Valid,
				}}
				onStepClick={(step) => {
					setError(null);
					if (currentStep === 4 || step === 5) {
						setHasReviewedStep4(true);
					}
					setCurrentStep(step);
				}}
			/>

			{/* Error Alert Banner */}
			{error && (
				<div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/15 border-2 border-rose-500/40 text-rose-300 text-xs font-bold shadow-lg">
					<AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
					<div className="flex-1 space-y-0.5">
						<p className="text-[11px] font-extrabold uppercase tracking-wider text-rose-400">
							⚠️ Isi Bagian Ini Terlebih Dahulu:
						</p>
						<p className="text-white text-xs">{error}</p>
					</div>
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
					<PreviewVideoStep
						previewVideoFile={previewVideoFile}
						onPreviewVideoFileChange={setPreviewVideoFile}
					/>
				)}

				{currentStep === 3 && (
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
						commercialPrice={commercialPrice}
						onCommercialPriceChange={setCommercialPrice}
						amVersionMin={amVersionMin}
						onAmVersionMinChange={setAmVersionMin}
						amVersionMax={amVersionMax}
						onAmVersionMaxChange={setAmVersionMax}
						remixFrom={remixFrom}
						onRemixFromChange={setRemixFrom}
					/>
				)}

				{currentStep === 4 && (
					<GrowthStep
						isPaid={isPaid}
						enableSocialLock={enableSocialLock}
						onEnableSocialLockChange={setEnableSocialLock}
						tiktokSoundTitle={tiktokSoundTitle}
						onTiktokSoundTitleChange={setTiktokSoundTitle}
						tiktokSoundUrl={tiktokSoundUrl}
						onTiktokSoundUrlChange={setTiktokSoundUrl}
						sultanPackUrl={sultanPackUrl}
						onSultanPackUrlChange={setSultanPackUrl}
					/>
				)}

				{currentStep === 5 && (
					<ReviewStep
						title={title}
						description={description}
						category={category}
						difficulty={difficulty}
						amVersionMin={formatAmVersion(amVersionMin)}
						amVersionMax={formatAmVersion(amVersionMax)}
						remixFrom={remixFrom.trim() || null}
						selectedFileTypes={selectedFileTypes}
						presetFile={presetFile}
						amLink={amLink}
						gdriveLink={gdriveLink}
						previewVideoFile={previewVideoFile}
						isPaid={isPaid}
						price={isPaid ? price : 0}
						commercialPrice={isPaid ? commercialPrice : 0}
						enableSocialLock={enableSocialLock}
						tiktokSoundTitle={tiktokSoundTitle}
						tiktokSoundUrl={tiktokSoundUrl}
						sultanPackUrl={sultanPackUrl}
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
							className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-2xl bg-[var(--color-interactive-primary)] text-white font-bold text-xs shadow-lg shadow-[var(--color-interactive-primary)]/20 hover:bg-[var(--color-interactive-primary-hover)] active:scale-95 transition-all cursor-pointer ml-auto"
						>
							<span>Next Step</span>
							<ArrowRight className="w-4 h-4" />
						</button>
					) : (
						<button
							type="button"
							onClick={handlePublish}
							disabled={isLoading}
							className="inline-flex items-center justify-center gap-2 min-h-[48px] px-8 rounded-2xl bg-gradient-to-r from-[var(--color-interactive-primary)] to-cyan-600 text-white font-bold text-xs shadow-xl shadow-[var(--color-interactive-primary)]/30 hover:opacity-95 active:scale-95 transition-all disabled:opacity-50 ml-auto"
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
