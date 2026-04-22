/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@impact/ui"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
