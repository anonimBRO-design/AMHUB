import type { Metadata } from "next";
import "@presethub/ui/tokens/tokens.css";
import "../styles/globals.css";

export const metadata: Metadata = {
	title: "PresetHub",
	description: "Premium After Effects Presets Marketplace",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
