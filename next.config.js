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
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Specify runtime for API routes to avoid Edge Runtime warnings
  experimental: {
    runtime: "nodejs",
  },
};

module.exports = nextConfig;
