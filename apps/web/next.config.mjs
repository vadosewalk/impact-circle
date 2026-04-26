/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@impact/ui"],
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8787";
    
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
