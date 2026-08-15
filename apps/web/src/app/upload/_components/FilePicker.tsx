"use client";

import type {
	PresetSourceFormat,
	PresetSourceType,
	ValidationCheck,
	ValidationResult,
} from "@/lib/validation/types";
import { validateAmLink } from "@/lib/validation/validateAmLink";
import { validateGoogleDriveXml } from "@/lib/validation/validateGoogleDriveXml";
import { validateXml } from "@/lib/validation/validateXml";
import {
	CheckSquare,
	ExternalLink,
	FileCheck,
	FileCode,
	HardDrive,
	Square,
	Upload,
} from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { ValidationCard } from "./ValidationCard";

interface FilePickerProps {
	selectedFileTypes: PresetSourceFormat[];
	onSelectedFileTypesChange: (types: PresetSourceFormat[]) => void;
	presetFile: File | null;
	onPresetFileChange: (file: File | null) => void;
	amLink: string;
	onAmLinkChange: (link: string, sourceType?: PresetSourceType) => void;
	gdriveLink: string;
	onGdriveLinkChange: (link: string) => void;
	validation: ValidationResult;
	onValidationChange: (res: ValidationResult) => void;
}

export function FilePicker({
	selectedFileTypes,
	onSelectedFileTypesChange,
	presetFile,
	onPresetFileChange,
	amLink,
	onAmLinkChange,
	gdriveLink,
	onGdriveLinkChange,
	validation,
	onValidationChange,
}: FilePickerProps) {
	const [isDragging, setIsDragging] = useState(false);
	const linkDebounceTimer = useRef<NodeJS.Timeout | null>(null);

	const toggleSourceFormat = (format: PresetSourceFormat) => {
		if (selectedFileTypes.includes(format)) {
			if (selectedFileTypes.length > 1) {
				onSelectedFileTypesChange(
					selectedFileTypes.filter((t) => t !== format),
				);
			}
		} else {
			onSelectedFileTypesChange([...selectedFileTypes, format]);
		}
	};

	// Combined Real-time Validation for all selected formats
	useEffect(() => {
		let isCancelled = false;

		if (linkDebounceTimer.current) {
			clearTimeout(linkDebounceTimer.current);
		}

		if (selectedFileTypes.length === 0) {
			onValidationChange({
				isValid: false,
				isValidating: false,
				checks: [],
				error: "Please select at least one preset source.",
			});
			return;
		}

		linkDebounceTimer.current = setTimeout(async () => {
			const allChecks: ValidationCheck[] = [];
			let overallValid = true;
			let overallValidating = false;
			let firstError: string | null = null;

			// 1. XML File Validation
			if (selectedFileTypes.includes("xml")) {
				if (!presetFile) {
					overallValid = false;
					if (!firstError)
						firstError = "XML File: Please upload an Alight Motion .xml file.";
					allChecks.push(
						{ id: "xml_selected", label: "XML file selected", status: "idle" },
						{ id: "xml_syntax", label: "XML syntax valid", status: "idle" },
					);
				} else {
					const xmlRes = await validateXml(presetFile);
					if (!xmlRes.isValid) overallValid = false;
					if (xmlRes.isValidating) overallValidating = true;
					if (xmlRes.error && !firstError)
						firstError = `XML File: ${xmlRes.error}`;
					allChecks.push(...xmlRes.checks);
				}
			}

			// 2. AM Link Validation
			if (selectedFileTypes.includes("link")) {
				if (!amLink.trim()) {
					overallValid = false;
					if (!firstError)
						firstError = "AM Link: Please enter an Alight Motion import link.";
					allChecks.push(
						{
							id: "am_url_format",
							label: "AM Link URL format valid",
							status: "idle",
						},
						{ id: "am_reachable", label: "AM Link reachable", status: "idle" },
					);
				} else {
					const amRes = await validateAmLink(amLink);
					if (!amRes.isValid) overallValid = false;
					if (amRes.isValidating) overallValidating = true;
					if (amRes.error && !firstError)
						firstError = `AM Link: ${amRes.error}`;
					allChecks.push(...amRes.checks);
				}
			}

			// 3. Google Drive XML Validation
			if (selectedFileTypes.includes("gdrive")) {
				if (!gdriveLink.trim()) {
					overallValid = false;
					if (!firstError)
						firstError =
							"Google Drive: Please enter a Google Drive link containing an XML preset.";
					allChecks.push(
						{
							id: "gdrive_url_format",
							label: "Google Drive URL format valid",
							status: "idle",
						},
						{
							id: "gdrive_reachable",
							label: "Google Drive XML file reachable",
							status: "idle",
						},
					);
				} else {
					const gdriveRes = await validateGoogleDriveXml(gdriveLink);
					if (!gdriveRes.isValid) overallValid = false;
					if (gdriveRes.isValidating) overallValidating = true;
					if (gdriveRes.error && !firstError)
						firstError = `Google Drive: ${gdriveRes.error}`;
					allChecks.push(...gdriveRes.checks);
				}
			}

			if (!isCancelled) {
				onValidationChange({
					isValid: overallValid,
					isValidating: overallValidating,
					checks: allChecks,
					error: firstError,
				});
			}
		}, 300);

		return () => {
			isCancelled = true;
			if (linkDebounceTimer.current) clearTimeout(linkDebounceTimer.current);
		};
	}, [selectedFileTypes, presetFile, amLink, gdriveLink, onValidationChange]);

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
			{/* Multi-Select Format Cards */}
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<span className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
						Preset Sources (Multi-Select)
					</span>
					<span className="text-[11px] font-semibold text-[var(--color-text-tertiary)]">
						Select one or more sources
					</span>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
					{/* XML File */}
					<button
						type="button"
						onClick={() => toggleSourceFormat("xml")}
						className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all active:scale-[0.98] ${
							selectedFileTypes.includes("xml")
								? "bg-blue-500/10 text-blue-400 border-blue-500 shadow-md"
								: "bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)]"
						}`}
					>
						{selectedFileTypes.includes("xml") ? (
							<CheckSquare className="w-5 h-5 text-blue-400 shrink-0" />
						) : (
							<Square className="w-5 h-5 text-[var(--color-text-tertiary)] shrink-0" />
						)}
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-1.5">
								<FileCode className="w-4 h-4 text-blue-400" />
								<span className="text-xs font-bold truncate">XML File</span>
							</div>
							<span className="text-[10px] text-[var(--color-text-tertiary)] block">
								Direct XML upload
							</span>
						</div>
					</button>

					{/* AM Link */}
					<button
						type="button"
						onClick={() => toggleSourceFormat("link")}
						className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all active:scale-[0.98] ${
							selectedFileTypes.includes("link")
								? "bg-emerald-500/10 text-emerald-400 border-emerald-500 shadow-md"
								: "bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)]"
						}`}
					>
						{selectedFileTypes.includes("link") ? (
							<CheckSquare className="w-5 h-5 text-emerald-400 shrink-0" />
						) : (
							<Square className="w-5 h-5 text-[var(--color-text-tertiary)] shrink-0" />
						)}
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-1.5">
								<ExternalLink className="w-4 h-4 text-emerald-400" />
								<span className="text-xs font-bold truncate">AM Link</span>
							</div>
							<span className="text-[10px] text-[var(--color-text-tertiary)] block">
								Alight Creative share
							</span>
						</div>
					</button>

					{/* Google Drive XML */}
					<button
						type="button"
						onClick={() => toggleSourceFormat("gdrive")}
						className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all active:scale-[0.98] ${
							selectedFileTypes.includes("gdrive")
								? "bg-amber-500/10 text-amber-400 border-amber-500 shadow-md"
								: "bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)]"
						}`}
					>
						{selectedFileTypes.includes("gdrive") ? (
							<CheckSquare className="w-5 h-5 text-amber-400 shrink-0" />
						) : (
							<Square className="w-5 h-5 text-[var(--color-text-tertiary)] shrink-0" />
						)}
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-1.5">
								<HardDrive className="w-4 h-4 text-amber-400" />
								<span className="text-xs font-bold truncate">
									Google Drive (XML)
								</span>
							</div>
							<span className="text-[10px] text-[var(--color-text-tertiary)] block">
								Cloud XML link
							</span>
						</div>
					</button>
				</div>
			</div>

			{/* Render All Selected Input Fields Concurrently */}
			<div className="space-y-6 pt-2">
				{/* 1. XML File Input */}
				{selectedFileTypes.includes("xml") && (
					<div className="space-y-2 p-5 rounded-2xl bg-[var(--color-bg-base)] border border-blue-500/20">
						<label
							htmlFor="preset-file-dropzone"
							className="block text-xs font-bold uppercase tracking-wider text-blue-400"
						>
							XML FILE
						</label>

						<div
							onDragOver={(e) => {
								e.preventDefault();
								setIsDragging(true);
							}}
							onDragLeave={() => setIsDragging(false)}
							onDrop={handleDrop}
							className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all text-center ${
								isDragging
									? "border-blue-500 bg-blue-500/10"
									: presetFile
										? "border-emerald-500/50 bg-emerald-500/5"
										: "border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] hover:border-[var(--color-border-strong)]"
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
								<div className="space-y-1.5">
									<div className="p-2.5 rounded-xl w-fit mx-auto bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
										<FileCheck className="w-6 h-6" />
									</div>
									<p className="text-xs font-bold text-[var(--color-text-primary)]">
										{presetFile.name}
									</p>
									<span className="text-[11px] font-semibold text-[var(--color-text-secondary)]">
										{(presetFile.size / 1024).toFixed(1)} KB
									</span>
								</div>
							) : (
								<div className="space-y-1.5">
									<div className="p-2.5 rounded-xl bg-[var(--color-bg-elevated)] text-blue-400 w-fit mx-auto border border-[var(--color-border-subtle)]">
										<Upload className="w-5 h-5" />
									</div>
									<p className="text-xs font-bold text-[var(--color-text-primary)]">
										Tap or drag Alight Motion XML file to upload
									</p>
									<p className="text-[11px] text-[var(--color-text-tertiary)]">
										Supports .xml project files up to 15MB
									</p>
								</div>
							)}
						</div>
					</div>
				)}

				{/* 2. AM Link Input */}
				{selectedFileTypes.includes("link") && (
					<div className="space-y-2 p-5 rounded-2xl bg-[var(--color-bg-base)] border border-emerald-500/20">
						<div className="flex items-center justify-between">
							<label
								htmlFor="am-link-input"
								className="block text-xs font-bold uppercase tracking-wider text-emerald-400"
							>
								ALIGHT MOTION IMPORT LINK
							</label>
							<div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-[11px] font-semibold text-[var(--color-text-secondary)]">
								<span className="text-[var(--color-text-tertiary)]">
									Provider:
								</span>
								<span className="font-bold text-emerald-400">
									Alight Creative
								</span>
							</div>
						</div>
						<input
							id="am-link-input"
							type="url"
							value={amLink}
							onChange={(e) =>
								onAmLinkChange(e.target.value, "alight_creative")
							}
							placeholder="https://alightcreative.com/am/share/..."
							className="w-full min-h-[48px] px-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-emerald-500"
						/>
					</div>
				)}

				{/* 3. Google Drive (XML) Input */}
				{selectedFileTypes.includes("gdrive") && (
					<div className="space-y-2 p-5 rounded-2xl bg-[var(--color-bg-base)] border border-amber-500/20">
						<label
							htmlFor="gdrive-link-input"
							className="block text-xs font-bold uppercase tracking-wider text-amber-400"
						>
							GOOGLE DRIVE (XML) LINK
						</label>
						<input
							id="gdrive-link-input"
							type="url"
							value={gdriveLink}
							onChange={(e) => onGdriveLinkChange(e.target.value)}
							placeholder="https://drive.google.com/file/d/..."
							className="w-full min-h-[48px] px-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-amber-500"
						/>
						<p className="text-[11px] text-[var(--color-text-tertiary)] leading-relaxed">
							Paste a public Google Drive share link pointing directly to your
							.xml preset file.
						</p>
					</div>
				)}
			</div>

			{/* Real-time Combined Validation Card */}
			<ValidationCard
				selectedFileTypes={selectedFileTypes}
				validation={validation}
			/>
		</div>
	);
}
