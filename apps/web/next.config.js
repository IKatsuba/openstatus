const { withContentlayer } = require("next-contentlayer");

const isRailway = !!process.env.RAILWAY_PROJECT_NAME;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ["@openstatus/ui", "@openstatus/api"],
  experimental: {
    serverComponentsExternalPackages: [
      "libsql",
      "@react-email/components",
      "@react-email/render",
      "@google-cloud/tasks",
      // "@libsql/client",
      // "better-sqlite3"
    ],
    optimizePackageImports: ["@tremor/react"],
    // FIXME: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
    missingSuspenseWithCSRBailout: false,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "screenshot.openstat.us",
      },
      {
        protocol: "https",
        hostname: "www.openstatus.dev",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  withContentlayer(nextConfig),
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,

    org: "openstatus",
    project: "openstatus",
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: false,

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  },
);
