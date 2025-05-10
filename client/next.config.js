/** @type {import('next').NextConfig} */
const nextConfig = {
  cleanDistDir: true,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  transpilePackages: ['canvacord', '@napi-rs/canvas', '@napi-rs/image', '@resvg/resvg-js'],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      'utf-8-validate': false,
    }

    // Handle native modules
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
      type: 'javascript/auto',
    })

    // Exclude native modules from being processed by webpack
    config.externals = [
      ...(config.externals || []),
      '@napi-rs/canvas',
      '@napi-rs/image',
      '@resvg/resvg-js',
      { sharp: 'commonjs sharp' },
    ]

    return config
  },
}

module.exports = nextConfig
