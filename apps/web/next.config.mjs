/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@impact/ui"],
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    // During build, if apiUrl is missing, or if it's a relative path (already on the same domain),
    // we skip the rewrite to let Netlify or the local dev server handle it.
    if (!apiUrl || !apiUrl.startsWith("http")) {
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
