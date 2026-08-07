"use client";

import type { ValidationResult } from "@/lib/validation/types";
import {
	AlertCircle,
	ArrowLeft,
	ArrowRight,
	Loader2,
	Sparkles,
	Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { DetailsStep } from "./DetailsStep";
import { FilePicker } from "./FilePicker";
import { ReviewStep } from "./ReviewStep";
import { ThumbnailStep } from "./ThumbnailStep";
import { WizardProgress } from "./WizardProgress";

const WIZARD_STEPS = [
	{ num: 1, label: "Format & File" },
	{ num: 2, label: "Thumbnail" },
	{ num: 3, label: "Preset Details" },
	{ num: 4, label: "Review & Publish" },
];

export function UploadWizard() {
	const router = useRouter();
	const [currentStep, setCurrentStep] = useState(1);
	const [isLoading, setIsLoading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [error, setError] = useState<string | null>(null);

	// Form State
	const [fileType, setFileType] = useState<"xml" | "qr" | "link">("xml");
	const [presetFile, setPresetFile] = useState<File | null>(null);
	const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
	const [amLink, setAmLink] = useState("");
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
		if (currentStep === 3) {
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
			if (!title.trim()) {
				setError("Title is required.");
				return;
			}
			setCurrentStep(4);
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
		upload_type: string,
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

	const handlePublish = async (e: FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setUploadProgress(0);
		setError(null);

		try {
			let uploadedPresetUrl: string | undefined = undefined;
			let uploadedThumbnailUrl: string | undefined = undefined;

			// 1. Upload thumbnail
			if (thumbnailFile) {
				uploadedThumbnailUrl = await uploadFile(
					thumbnailFile,
					"thumbnail",
					thumbnailFile.type || "image/jpeg",
				);
			}

			// 2. Upload preset file if xml/qr
			if (fileType !== "link" && presetFile) {
				uploadedPresetUrl = await uploadFile(
					presetFile,
					fileType === "xml" ? "xml" : "qr",
					presetFile.type || (fileType === "xml" ? "text/xml" : "image/jpeg"),
				);
			}

			// 3. Create Preset record
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
					file_type: fileType,
					file_url: uploadedPresetUrl || undefined,
					am_link:
						fileType === "qr" && validation.decodedPayload
							? validation.decodedPayload
							: amLink.trim() || undefined,
					category,
					difficulty,
				}),
			});

			const createJson = await createRes.json();
			if (!createRes.ok) {
				// Rollback: Delete uploaded files if database insertion fails
				const cleanupPaths = [];
				if (uploadedThumbnailUrl)
					cleanupPaths.push({
						bucket: "thumbnails",
						path: uploadedThumbnailUrl,
					});
				if (uploadedPresetUrl)
					cleanupPaths.push({
						bucket: "preset-files",
						path: uploadedPresetUrl,
					});

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
				throw new Error(createJson.error?.message || "Failed to create preset");
			}

			router.push(`/preset/${slug}`);
		} catch (err: unknown) {
			setError(
				err instanceof Error ? err.message : "An unexpected error occurred.",
			);
			setIsLoading(false);
		}
	};

	return (
		<div className="max-w-2xl mx-auto space-y-6 pb-24 sm:pb-12">
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
						onAmLinkChange={setAmLink}
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

				{currentStep === 4 && (
					<ReviewStep
						title={title}
						description={description}
						category={category}
						difficulty={difficulty}
						fileType={fileType}
						presetFile={presetFile}
						thumbnailFile={thumbnailFile}
						amLink={amLink}
					/>
				)}
			</div>

			{/* Navigation Buttons */}
			<div className="fixed bottom-0 left-0 right-0 z-40 sm:relative p-4 sm:p-0 bg-[var(--color-bg-surface)]/95 sm:bg-transparent backdrop-blur-xl sm:backdrop-blur-none border-t border-[var(--color-border-subtle)] sm:border-0 shadow-2xl sm:shadow-none pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] sm:pb-0">
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

					{currentStep < 4 ? (
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
