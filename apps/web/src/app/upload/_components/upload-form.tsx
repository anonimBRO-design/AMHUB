"use client";

import { Button, Input } from "@presethub/ui";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useState } from "react";

const CATEGORIES = [
	"velocity",
	"transition",
	"color",
	"anime",
	"gaming",
	"lyric",
];

export function UploadForm() {
	const router = useRouter();
	const [step, setStep] = useState<1 | 2 | 3>(1);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Form state
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [category, setCategory] = useState("velocity");
	const [fileType, setFileType] = useState<"xml" | "gdrive" | "link">("xml");
	const [difficulty, setDifficulty] = useState<
		"beginner" | "intermediate" | "advanced"
	>("beginner");
	const [presetFile, setPresetFile] = useState<File | null>(null);
	const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
	const [amLink, setAmLink] = useState("");

	const handlePresetFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.[0]) {
			setPresetFile(e.target.files[0]);
		}
	};

	const handleThumbnailFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.[0]) {
			setThumbnailFile(e.target.files[0]);
		}
	};

	const handleNextStep = () => {
		setError(null);
		if (step === 1) {
			if (fileType !== "link" && !presetFile) {
				setError("Please select a preset file.");
				return;
			}
			if (fileType === "link" && !amLink.trim()) {
				setError("Please enter an Alight Motion link.");
				return;
			}
			if (!thumbnailFile) {
				setError("Please upload a thumbnail image.");
				return;
			}
			setStep(2);
		} else if (step === 2) {
			if (!title.trim()) {
				setError("Title is required.");
				return;
			}
			setStep(3);
		}
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			let uploadedPresetUrl: string | undefined = undefined;
			let uploadedThumbnailUrl: string | undefined = undefined;

			// 1. Upload thumbnail file
			if (thumbnailFile) {
				const thumbRes = await fetch("/api/uploads/preset", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						upload_type: "thumbnail",
						filename: thumbnailFile.name,
						content_type: thumbnailFile.type || "image/jpeg",
						size: thumbnailFile.size,
					}),
				});

				const thumbJson = await thumbRes.json();
				if (!thumbRes.ok) {
					throw new Error(
						thumbJson.error?.message || "Failed to prepare thumbnail upload",
					);
				}

				await fetch(thumbJson.data.upload_url, {
					method: "PUT",
					headers: { "Content-Type": thumbnailFile.type || "image/jpeg" },
					body: thumbnailFile,
				});

				uploadedThumbnailUrl = thumbJson.data.storage_path;
			}

			// 2. Upload preset file if xml
			if (fileType !== "link" && presetFile) {
				const uploadType = "xml";
				const fileRes = await fetch("/api/uploads/preset", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						upload_type: uploadType,
						filename: presetFile.name,
						content_type: presetFile.type || "text/xml",
						size: presetFile.size,
					}),
				});

				const fileJson = await fileRes.json();
				if (!fileRes.ok) {
					throw new Error(
						fileJson.error?.message || "Failed to prepare file upload",
					);
				}

				await fetch(fileJson.data.upload_url, {
					method: "PUT",
					headers: {
						"Content-Type":
							presetFile.type ||
							(uploadType === "xml" ? "text/xml" : "image/jpeg"),
					},
					body: presetFile,
				});

				uploadedPresetUrl = fileJson.data.storage_path;
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
					am_link: amLink.trim() || undefined,
					category,
					difficulty,
				}),
			});

			const createJson = await createRes.json();
			if (!createRes.ok) {
				throw new Error(createJson.error?.message || "Failed to create preset");
			}

			const destinationSlug = createJson.data?.slug ?? createJson.slug ?? slug;
			router.push(`/preset/${destinationSlug}`);
		} catch (err: unknown) {


			setError(
				err instanceof Error ? err.message : "An unexpected error occurred.",
			);
			setIsLoading(false);
		}
	};

	return (
		<div className="mx-auto max-w-2xl p-6 space-y-6 bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border-subtle)]">
			<h1 className="text-2xl font-bold">Upload Preset</h1>

			{/* Step indicator */}
			<div className="flex justify-between border-b pb-4">
				{[
					{ num: 1, label: "Files" },
					{ num: 2, label: "Details" },
					{ num: 3, label: "Publish" },
				].map((s) => (
					<span
						key={s.num}
						className={`font-semibold text-sm ${
							step === s.num
								? "text-[var(--color-interactive-primary)] border-b-2 border-[var(--color-interactive-primary)] pb-1"
								: "text-[var(--color-text-tertiary)]"
						}`}
					>
						{s.num}. {s.label}
					</span>
				))}
			</div>

			{error && (
				<div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-md">
					{error}
				</div>
			)}

			{step === 1 && (
				<div className="space-y-4">
					<div>
						<label
							htmlFor="file-type-select"
							className="block text-sm font-medium mb-1"
						>
							Preset Format
						</label>
						<select
							id="file-type-select"
							value={fileType}
							onChange={(e) =>
								setFileType(e.target.value as "xml" | "gdrive" | "link")
							}
							className="w-full rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-2 text-sm"
						>
							<option value="xml">XML File (.xml)</option>
							<option value="gdrive">Google Drive (XML)</option>
							<option value="link">Alight Motion Link</option>
						</select>
					</div>

					{fileType !== "link" ? (
						<div>
							<label
								htmlFor="preset-file-input"
								className="block text-sm font-medium mb-1"
							>
								Preset File ({fileType.toUpperCase()})
							</label>
							<input
								id="preset-file-input"
								type="file"
								accept={fileType === "xml" ? ".xml" : "image/*"}
								onChange={handlePresetFileChange}
								className="w-full text-sm text-[var(--color-text-secondary)] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-interactive-primary)] file:text-white hover:file:bg-[var(--color-interactive-primary-hover)] cursor-pointer"
							/>
						</div>
					) : (
						<Input
							label="Alight Motion Link"
							value={amLink}
							onChange={setAmLink}
							placeholder="https://alight.link/..."
							isRequired
						/>
					)}

					<div>
						<label
							htmlFor="thumbnail-file-input"
							className="block text-sm font-medium mb-1"
						>
							Thumbnail Preview Image
						</label>
						<input
							id="thumbnail-file-input"
							type="file"
							accept="image/jpeg,image/png,image/webp"
							onChange={handleThumbnailFileChange}
							className="w-full text-sm text-[var(--color-text-secondary)] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-interactive-primary)] file:text-white hover:file:bg-[var(--color-interactive-primary-hover)] cursor-pointer"
						/>
					</div>

					<div className="flex justify-end pt-4">
						<Button onClick={handleNextStep}>Next: Details</Button>
					</div>
				</div>
			)}

			{step === 2 && (
				<div className="space-y-4">
					<Input
						label="Title"
						value={title}
						onChange={setTitle}
						placeholder="e.g. Smooth Velocity Edit"
						isRequired
					/>

					<div>
						<label
							htmlFor="description-input"
							className="block text-sm font-medium mb-1"
						>
							Description
						</label>
						<textarea
							id="description-input"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={3}
							className="w-full rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-2 text-sm text-[var(--color-text-primary)]"
							placeholder="Brief description of your preset..."
						/>
					</div>

					<div>
						<label
							htmlFor="category-select"
							className="block text-sm font-medium mb-1"
						>
							Category
						</label>
						<select
							id="category-select"
							value={category}
							onChange={(e) => setCategory(e.target.value)}
							className="w-full rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-2 text-sm text-[var(--color-text-primary)]"
						>
							{CATEGORIES.map((cat) => (
								<option key={cat} value={cat}>
									{cat.charAt(0).toUpperCase() + cat.slice(1)}
								</option>
							))}
						</select>
					</div>

					<div>
						<label
							htmlFor="difficulty-select"
							className="block text-sm font-medium mb-1"
						>
							Difficulty
						</label>
						<select
							id="difficulty-select"
							value={difficulty}
							onChange={(e) =>
								setDifficulty(
									e.target.value as "beginner" | "intermediate" | "advanced",
								)
							}
							className="w-full rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-2 text-sm text-[var(--color-text-primary)]"
						>
							<option value="beginner">Beginner</option>
							<option value="intermediate">Intermediate</option>
							<option value="advanced">Advanced</option>
						</select>
					</div>

					<div className="flex justify-between pt-4">
						<Button variant="ghost" onClick={() => setStep(1)}>
							Back
						</Button>
						<Button onClick={handleNextStep}>Next: Publish</Button>
					</div>
				</div>
			)}

			{step === 3 && (
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="p-4 bg-[var(--color-bg-elevated)] rounded-lg space-y-2">
						<h3 className="font-semibold text-lg">{title}</h3>
						<p className="text-sm text-[var(--color-text-secondary)]">
							{description || "No description."}
						</p>
						<div className="flex gap-2 text-xs text-[var(--color-text-tertiary)] pt-2">
							<span className="capitalize">Category: {category}</span>
							<span>•</span>
							<span className="capitalize">Difficulty: {difficulty}</span>
							<span>•</span>
							<span>Format: {fileType.toUpperCase()}</span>
						</div>
					</div>

					<div className="flex justify-between pt-4">
						<Button
							type="button"
							variant="ghost"
							onClick={() => setStep(2)}
							isDisabled={isLoading}
						>
							Back
						</Button>
						<Button type="submit" isLoading={isLoading}>
							Publish Preset
						</Button>
					</div>
				</form>
			)}
		</div>
	);
}
