/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    CRON_SECRET: process.env.CRON_SECRET,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        url: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
        buffer: false,
        util: false,
      };
    }

    // Exclude problematic modules from bundling
    config.externals = config.externals || [];
    config.externals.push({
      undici: "undici",
      cheerio: "cheerio",
    });

    return config;
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    serverComponentsExternalPackages: ["cheerio"],
  },
  // Next.js 15 has better Edge Runtime support
  poweredByHeader: false,
  reactStrictMode: true,
};

module.exports = nextConfig;
