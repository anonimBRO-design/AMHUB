"use client";

import type { ValidationResult } from "@/lib/validation/types";
import { validateAmLink } from "@/lib/validation/validateAmLink";
import { validateGoogleDriveXml } from "@/lib/validation/validateGoogleDriveXml";
import { validateXml } from "@/lib/validation/validateXml";
import {
	ExternalLink,
	FileCheck,
	FileCode,
	HardDrive,
	Upload,
} from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { ValidationCard } from "./ValidationCard";

import type { PresetSourceType } from "@/lib/validation/types";

interface FilePickerProps {
	fileType: "xml" | "gdrive" | "link";
	onFileTypeChange: (type: "xml" | "gdrive" | "link") => void;
	presetFile: File | null;
	onPresetFileChange: (file: File | null) => void;
	amLink: string;
	onAmLinkChange: (link: string, sourceType?: PresetSourceType) => void;
	gdriveLink: string;
	onGdriveLinkChange: (link: string) => void;
	validation: ValidationResult;
	onValidationChange: (res: ValidationResult) => void;
	amLinkSourceType: PresetSourceType | null;
	onAmLinkSourceTypeChange: (type: PresetSourceType | null) => void;
}

export function FilePicker({
	fileType,
	onFileTypeChange,
	presetFile,
	onPresetFileChange,
	amLink,
	onAmLinkChange,
	gdriveLink,
	onGdriveLinkChange,
	validation,
	onValidationChange,
	amLinkSourceType,
	onAmLinkSourceTypeChange,
}: FilePickerProps) {
	const [isDragging, setIsDragging] = useState(false);
	const linkDebounceTimer = useRef<NodeJS.Timeout | null>(null);

	// Validate XML whenever presetFile or fileType changes
	useEffect(() => {
		let isCancelled = false;

		if (fileType === "xml") {
			onValidationChange({
				isValid: false,
				isValidating: Boolean(presetFile),
				checks: [
					{
						id: "file_selected",
						label: "XML file selected",
						status: presetFile ? "loading" : "idle",
					},
					{
						id: "file_size",
						label: "File size within limit (≤15MB)",
						status: "idle",
					},
					{ id: "file_readable", label: "File readable", status: "idle" },
					{ id: "xml_syntax", label: "XML syntax valid", status: "idle" },
					{
						id: "preset_structure",
						label: "Alight Motion preset structure detected",
						status: "idle",
					},
				],
				error: presetFile ? null : "Please select an Alight Motion XML file.",
			});

			if (presetFile) {
				validateXml(presetFile).then((res) => {
					if (!isCancelled) onValidationChange(res);
				});
			}
		}

		return () => {
			isCancelled = true;
		};
	}, [fileType, presetFile, onValidationChange]);

	// Validate Google Drive (XML) with debounce
	useEffect(() => {
		if (fileType !== "gdrive") return;

		if (linkDebounceTimer.current) {
			clearTimeout(linkDebounceTimer.current);
		}

		if (!gdriveLink.trim()) {
			onValidationChange({
				isValid: false,
				isValidating: false,
				checks: [
					{
						id: "url_format",
						label: "Valid HTTPS Google Drive URL format",
						status: "idle",
					},
					{
						id: "xml_file_target",
						label: "Points to an XML preset file (not a folder)",
						status: "idle",
					},
					{
						id: "reachable",
						label: "Link reachable & publicly accessible",
						status: "idle",
					},
				],
				error: "Please enter a Google Drive link containing an XML preset.",
			});
			return;
		}

		onValidationChange({
			isValid: false,
			isValidating: true,
			checks: [
				{
					id: "url_format",
					label: "Valid HTTPS Google Drive URL format",
					status: "loading",
				},
				{
					id: "xml_file_target",
					label: "Points to an XML preset file (not a folder)",
					status: "idle",
				},
				{
					id: "reachable",
					label: "Link reachable & publicly accessible",
					status: "idle",
				},
			],
			error: null,
		});

		linkDebounceTimer.current = setTimeout(() => {
			validateGoogleDriveXml(gdriveLink).then((res) => {
				onValidationChange(res);
			});
		}, 400);

		return () => {
			if (linkDebounceTimer.current) clearTimeout(linkDebounceTimer.current);
		};
	}, [fileType, gdriveLink, onValidationChange]);

	// Validate AM Link with debounce
	useEffect(() => {
		if (fileType !== "link") return;

		if (linkDebounceTimer.current) {
			clearTimeout(linkDebounceTimer.current);
		}

		if (!amLink.trim()) {
			onValidationChange({
				isValid: false,
				isValidating: false,
				checks: [
					{
						id: "url_format",
						label: "URL format & HTTPS protocol valid",
						status: "idle",
					},
					{
						id: "supported_host",
						label: "Supported preset provider hostname",
						status: "idle",
					},
					{
						id: "reachable",
						label: "Link reachable (HTTP 200/301)",
						status: "idle",
					},
				],
				error: "Please enter an Alight Motion import link.",
			});
			return;
		}

		onValidationChange({
			isValid: false,
			isValidating: true,
			checks: [
				{
					id: "url_format",
					label: "URL format & HTTPS protocol valid",
					status: "loading",
				},
				{
					id: "supported_host",
					label: "Supported preset provider hostname",
					status: "idle",
				},
				{
					id: "reachable",
					label: "Link reachable (HTTP 200/301)",
					status: "idle",
				},
			],
			error: null,
		});

		linkDebounceTimer.current = setTimeout(() => {
			validateAmLink(amLink).then((res) => {
				onValidationChange(res);
			});
		}, 400);

		return () => {
			if (linkDebounceTimer.current) clearTimeout(linkDebounceTimer.current);
		};
	}, [fileType, amLink, onValidationChange]);

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
						onClick={() => {
							onFileTypeChange("xml");
							onPresetFileChange(null);
						}}
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
						onClick={() => {
							onFileTypeChange("link");
							onPresetFileChange(null);
						}}
						className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all active:scale-95 ${
							fileType === "link"
								? "bg-[var(--color-interactive-primary)]/10 text-[var(--color-interactive-primary)] border-[var(--color-interactive-primary)] shadow-md"
								: "bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)]"
						}`}
					>
						<ExternalLink className="w-5 h-5 mb-1 text-emerald-400" />
						<span className="text-xs font-bold">AM Link</span>
					</button>

					<button
						type="button"
						onClick={() => {
							onFileTypeChange("gdrive");
							onPresetFileChange(null);
						}}
						className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all active:scale-95 ${
							fileType === "gdrive"
								? "bg-[var(--color-interactive-primary)]/10 text-[var(--color-interactive-primary)] border-[var(--color-interactive-primary)] shadow-md"
								: "bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)]"
						}`}
					>
						<HardDrive className="w-5 h-5 mb-1 text-amber-400" />
						<span className="text-xs font-bold">Google Drive (XML)</span>
					</button>
				</div>
			</div>

			{/* Drop Zone or Input */}
			{fileType === "xml" ? (
				<div className="space-y-2">
					<label
						htmlFor="preset-file-dropzone"
						className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]"
					>
						Upload XML (.xml) File
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
									? validation.isValid
										? "border-emerald-500/50 bg-emerald-500/5"
										: "border-rose-500/50 bg-rose-500/5"
									: "border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] hover:border-[var(--color-border-strong)]"
						}`}
					>
						<input
							id="preset-file-dropzone"
							type="file"
							accept=".xml"
							onChange={handleFileSelect}
							className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
						/>

						{presetFile ? (
							<div className="space-y-2">
								<div
									className={`p-3 rounded-2xl w-fit mx-auto border ${
										validation.isValid
											? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
											: "bg-rose-500/10 text-rose-400 border-rose-500/20"
									}`}
								>
									<FileCheck className="w-8 h-8" />
								</div>
								<p className="text-sm font-bold text-[var(--color-text-primary)]">
									{presetFile.name}
								</p>
								<span className="text-xs font-semibold flex items-center justify-center gap-1 text-[var(--color-text-secondary)]">
									{(presetFile.size / 1024).toFixed(1)} KB
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
									Supports .xml project files
								</p>
							</div>
						)}
					</div>
				</div>
			) : fileType === "gdrive" ? (
				<div className="space-y-2">
					<label
						htmlFor="gdrive-link-input"
						className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]"
					>
						Google Drive (XML) Link
					</label>
					<input
						id="gdrive-link-input"
						type="url"
						value={gdriveLink}
						onChange={(e) => onGdriveLinkChange(e.target.value)}
						placeholder="https://drive.google.com/file/d/..."
						className="w-full min-h-[48px] px-4 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-interactive-primary)]"
					/>
					<p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">
						Paste a public Google Drive share link pointing directly to your .xml preset file. Make sure link sharing is set to &quot;Anyone with the link&quot;.
					</p>
				</div>
			) : (
				<div className="space-y-2">
					<label
						htmlFor="am-link-input"
						className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]"
					>
						Alight Motion Import Link
					</label>
					<div className="flex items-center gap-2">
						<input
							id="am-link-input"
							type="url"
							value={amLink}
							onChange={(e) => onAmLinkChange(e.target.value, "alight_creative")}
							placeholder="https://alightcreative.com/am/share/..."
							className="flex-1 min-h-[48px] px-4 rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-interactive-primary)]"
						/>

						<select
							value="alight_creative"
							onChange={(e) => onAmLinkSourceTypeChange(e.target.value as PresetSourceType)}
							className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-2 text-sm text-[var(--color-text-primary)] cursor-pointer min-w-[140px] h-[48px]"
						>
							<option value="alight_creative">Alight Creative</option>
						</select>
					</div>
				</div>
			)}

			{/* Real-time Validation Card */}
			<ValidationCard fileType={fileType} validation={validation} />
		</div>
	);
}
