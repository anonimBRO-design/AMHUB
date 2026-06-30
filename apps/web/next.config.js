/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	transpilePackages: ["@presethub/ui", "@presethub/types", "@presethub/config"],
};

export default nextConfig;
