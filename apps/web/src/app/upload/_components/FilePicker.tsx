"use client";

import {
	Check,
	ExternalLink,
	FileCheck,
	FileCode,
	QrCode,
	Upload,
} from "lucide-react";
import { type ChangeEvent, useState } from "react";

interface FilePickerProps {
	fileType: "xml" | "qr" | "link";
	onFileTypeChange: (type: "xml" | "qr" | "link") => void;
	presetFile: File | null;
	onPresetFileChange: (file: File | null) => void;
	amLink: string;
	onAmLinkChange: (link: string) => void;
}

export function FilePicker({
	fileType,
	onFileTypeChange,
	presetFile,
	onPresetFileChange,
	amLink,
	onAmLinkChange,
}: FilePickerProps) {
	const [isDragging, setIsDragging] = useState(false);

	const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.[0]) {
			onPresetFileChange(e.target.files[0]);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		if (e.dataTransfer.files?.[0]) {
			onPresetFileChange(e.dataTransfer.files[0]);
		}
	};

	return (
		<div className="space-y-6">
			{/* Format Selection Cards */}
			<div className="space-y-2">
				<span className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
					Select Preset Format
				</span>
				<div className="grid grid-cols-3 gap-2.5">
					<button
						type="button"
						onClick={() => onFileTypeChange("xml")}
						className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all active:scale-95 ${
							fileType === "xml"
								? "bg-[var(--color-interactive-primary)]/10 text-[var(--color-interactive-primary)] border-[var(--color-interactive-primary)] shadow-md"
								: "bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)]"
						}`}
					>
						<FileCode className="w-5 h-5 mb-1 text-blue-400" />
						<span className="text-xs font-bold">XML File</span>
					</button>

					<button
						type="button"
						onClick={() => onFileTypeChange("qr")}
						className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all active:scale-95 ${
							fileType === "qr"
								? "bg-[var(--color-interactive-primary)]/10 text-[var(--color-interactive-primary)] border-[var(--color-interactive-primary)] shadow-md"
								: "bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)]"
						}`}
					>
						<QrCode className="w-5 h-5 mb-1 text-purple-400" />
						<span className="text-xs font-bold">QR Image</span>
					</button>

					<button
						type="button"
						onClick={() => onFileTypeChange("link")}
						className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all active:scale-95 ${
							fileType === "link"
								? "bg-[var(--color-interactive-primary)]/10 text-[var(--color-interactive-primary)] border-[var(--color-interactive-primary)] shadow-md"
								: "bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)]"
						}`}
					>
						<ExternalLink className="w-5 h-5 mb-1 text-emerald-400" />
						<span className="text-xs font-bold">AM Link</span>
					</button>
				</div>
			</div>

			{/* Drop Zone or Input */}
			{fileType !== "link" ? (
				<div className="space-y-2">
					<label
						htmlFor="preset-file-dropzone"
						className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]"
					>
						Upload {fileType === "xml" ? "XML (.xml)" : "QR Image"} File
					</label>

					<div
						onDragOver={(e) => {
							e.preventDefault();
							setIsDragging(true);
						}}
						onDragLeave={() => setIsDragging(false)}
						onDrop={handleDrop}
						className={`relative flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed transition-all text-center ${
							isDragging
								? "border-[var(--color-interactive-primary)] bg-[var(--color-interactive-primary)]/5"
								: presetFile
									? "border-emerald-500/50 bg-emerald-500/5"
									: "border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] hover:border-[var(--color-border-strong)]"
						}`}
					>
						<input
							id="preset-file-dropzone"
							type="file"
							accept={fileType === "xml" ? ".xml" : "image/*"}
							onChange={handleFileSelect}
							className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
						/>

						{presetFile ? (
							<div className="space-y-2">
								<div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 w-fit mx-auto border border-emerald-500/20">
									<FileCheck className="w-8 h-8" />
								</div>
								<p className="text-sm font-bold text-[var(--color-text-primary)]">
									{presetFile.name}
								</p>
								<span className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1">
									<Check className="w-3.5 h-3.5" /> File Selected (
									{(presetFile.size / 1024).toFixed(1)} KB)
								</span>
							</div>
						) : (
							<div className="space-y-2">
								<div className="p-3 rounded-2xl bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] w-fit mx-auto border border-[var(--color-border-subtle)]">
									<Upload className="w-6 h-6" />
								</div>
								<p className="text-sm font-bold text-[var(--color-text-primary)]">
									Tap or drag file to upload
								</p>
								<p className="text-xs text-[var(--color-text-tertiary)]">
									Supports{" "}
									{fileType === "xml"
										? ".xml project files"
										: "JPEG, PNG, WebP QR codes"}
								</p>
							</div>
						)}
					</div>
				</div>
			) : (
				<div className="space-y-2">
					<label
						htmlFor="am-link-input"
						className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]"
					>
						Alight Motion Import Link
					</label>
					<input
						id="am-link-input"
						type="url"
						value={amLink}
						onChange={(e) => onAmLinkChange(e.target.value)}
						placeholder="https://alight.link/..."
						className="w-full min-h-[48px] px-4 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-interactive-primary)]"
					/>
				</div>
			)}
		</div>
	);
}
