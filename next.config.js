const nextEnv = require('next-env');
const dotenvLoad = require('dotenv-load');
const { i18n } = require('./next-i18next.config');
const path = require('path');

dotenvLoad();
 
const withNextEnv = nextEnv();

 /** @type {import('next').NextConfig}*/
const config =  {
  ...(process.env.BASE_PATH ? {
    basePath: process.env.BASE_PATH,
  } : process.env.GITHUB_REPOSITORY ? {
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
  compress: false,
  optimization: {
    minimize: false,
  },
  webpack: (config, { defaultLoaders: { babel } }) => {
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

module.exports = withNextEnv(config);
