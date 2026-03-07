/**
 * Next.js configuration with redirects for legacy slugs.
 * Adds a permanent redirect from /terms-and-conditions to /terms-of-service
 */
const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
    },
    async redirects() {
        return [
            {
                source: '/terms-and-conditions',
                destination: '/terms-of-service',
                permanent: true,
            },
        ]
    },
    async headers() {
        return [
            {
                // Apply security headers to all routes
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(self), microphone=(self), geolocation=()',
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://va.vercel-scripts.com https://vercel.live https://*.daily.co",
                            "worker-src 'self' blob:",
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            "font-src 'self' data: https://fonts.gstatic.com",
                            "img-src 'self' data: blob: https: http:",
                            "media-src 'self' blob: https://*.daily.co",
                            "connect-src 'self' http://localhost:8000 https://*.supabase.co wss://*.supabase.co https://api.bondhu.tech https://api.vapi.ai wss://api.vapi.ai https://*.daily.co wss://*.daily.co https://*.sentry.io https://*.vercel-insights.com https://vercel.live",
                            "frame-ancestors 'none'",
                            "base-uri 'self'",
                            "form-action 'self'",
                        ].join('; '),
                    },
                ],
            },
        ]
    },
    // Turbopack config with explicit root directory
    turbopack: {
        root: path.resolve(__dirname),
    },
    webpack: (config, { isServer }) => {
        // Suppress warnings for optional gray-matter dependencies
        config.ignoreWarnings = [
            ...(config.ignoreWarnings || []),
            { module: /node_modules\/gray-matter\/lib\/parsers\.js/ },
        ];

        // Mark optional dependencies as externals to avoid bundling warnings
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                'coffee-script': false,
                'toml': false,
            };
        }

        return config;
    },
}

module.exports = nextConfig
