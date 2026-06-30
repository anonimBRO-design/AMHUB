import { Download, ExternalLink, QrCode } from "lucide-react";
import * as React from "react";
import { Button } from "../../atoms/button";
import { cn } from "../../lib/utils";

export interface DownloadButtonProps {
	presetId: string;
	fileType: "xml" | "qr" | "link";
	isAuthenticated: boolean;
	onDownloadStart?: (presetId: string) => void;
	onDownloadComplete?: (presetId: string) => void;
	size?: "md" | "lg";
}

export const DownloadButton = ({
	presetId,
	fileType,
	isAuthenticated,
	onDownloadStart,
	onDownloadComplete,
	size = "lg",
}: DownloadButtonProps) => {
	const [isLoading, setIsLoading] = React.useState(false);
	const [isSuccess, setIsSuccess] = React.useState(false);

	const getLabel = () => {
		if (isSuccess) return "✓ Downloaded";
		if (isLoading) return "Getting your file...";
		switch (fileType) {
			case "xml":
				return "Download Preset";
			case "qr":
				return "Get QR Code";
			case "link":
				return "Open in Alight Motion";
		}
	};

	const getIcon = () => {
		switch (fileType) {
			case "xml":
				return Download;
			case "qr":
				return QrCode;
			case "link":
				return ExternalLink;
		}
	};

	const handleClick = async () => {
		setIsLoading(true);
		onDownloadStart?.(presetId);

		// Simulate download delay
		await new Promise((resolve) => setTimeout(resolve, 2000));

		setIsLoading(false);
		setIsSuccess(true);
		onDownloadComplete?.(presetId);

		setTimeout(() => setIsSuccess(false), 3000);
	};

	return (
		<Button
			size={size}
			onClick={handleClick}
			isLoading={isLoading}
			leadingIcon={!isLoading && !isSuccess ? getIcon() : undefined}
			variant={isSuccess ? "secondary" : "default"}
		>
			{getLabel()}
		</Button>
	);
};
