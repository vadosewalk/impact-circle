/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@impact/ui"],
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    // During build or if apiUrl is missing, we skip adding the rewrite
    // to prevent protocol errors in the destination string.
    if (!apiUrl) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
