const isProd = process.env.NODE_ENV === 'production';
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Disable default image optimization
  },
  assetPrefix: isProd ? '/projeto-ruboNegro/' : '',
  basePath: isProd ? '/projeto-ruboNegro' : '',
  output: 'export',
  distDir: 'dist',
};

export default nextConfig;
