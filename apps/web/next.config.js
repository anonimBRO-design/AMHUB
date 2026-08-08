import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	transpilePackages: ["@presethub/ui", "@presethub/types", "@presethub/config"],
	serverExternalPackages: ["zod"],
	outputFileTracingRoot: path.resolve(__dirname, "../"),
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "images.unsplash.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "api.dicebear.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "*.supabase.co",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "avatars.githubusercontent.com",
				pathname: "/**",
			},
		],
	},
};

export default nextConfig;
