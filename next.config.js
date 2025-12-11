/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for simple Vercel deployment
  // Remove this if you need server-side features later
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
