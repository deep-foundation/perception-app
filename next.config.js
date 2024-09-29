const nextEnv = require('next-env');
const dotenvLoad = require('dotenv-load');
const { i18n } = require('./next-i18next.config');
const path = require('path');
const { StatsWriterPlugin } = require('webpack-stats-plugin');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

dotenvLoad();
 
const withNextEnv = nextEnv();

 /** @type {import('next').NextConfig}*/
const config =  {
  ...(process.env.BASE_PATH ? (process.env.BASE_PATH === '/' ? {} : {
    basePath: process.env.BASE_PATH,
  }) : process.env.GITHUB_REPOSITORY ? {
    basePath: `/${process.env.GITHUB_REPOSITORY.split('/')[1]}`,
  } : {}),
  distDir: 'app',
  strictMode: false,
  output: (+process.env.NEXT_PUBLIC_EXPORT) ? 'export' : 'standalone',
  transpilePackages: ['open-chakra', '@deep-foundation/deepmemo-imports'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  compress: true,
  experimental: {
    serverSourceMaps: true,
  },
  // Automatically bundle external packages in the Pages Router:
  // bundlePagesRouterDependencies: true,
  // Opt specific packages out of bundling for both App and Pages Router:
  // serverExternalPackages: ['react-icons'],
  webpack: (config, options) => {
    const { defaultLoaders: { babel } } = options;
    if (!options.dev && !options.isServer) {
      config.plugins.push(
        new StatsWriterPlugin({
          filename: '../webpack-stats.json',
          stats: {
            assets: true,
            chunks: true,
            modules: true
          }
        })
      );
    }
    // config.module = {
    //   ...config.module,
    //   rules: [
    //     ...config.module.rules,
    //     {
    //       include: [path.resolve(__dirname, '/node_modules/open-chakra')],
    //       test: /\.(js|jsx|ts|tsx)$/,
    //       use: [babel],
    //     },
    //   ],
    // };
    // config.optimization.minimize = false;
    config.resolve.fallback = {
      "buffer":false,
      "events": false,
      "os": false,
      "fs": false,
      "tls": false,
      "net": false,
      "path": false,
      "zlib": false,
      "http": false,
      "https": false,
      "stream": false,
      "crypto": false,
    };
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      react: path.resolve('./node_modules/react'),
    };

    return config;
  },
  ...(+(process?.env?.NEXT_PUBLIC_I18N_DISABLE || 0) ? {} : { i18n }),
}

// module.exports = withBundleAnalyzer(withNextEnv(config));
module.exports = withNextEnv(config);
