import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // Return cell colors - must be safelisted for dynamic class generation
    'bg-red-500',
    'bg-red-600',
    'bg-red-700',
    'bg-red-800',
    'bg-red-900',
    'bg-green-500',
    'bg-green-600',
    'bg-green-700',
    'bg-green-800',
    'bg-green-900',
    'bg-neutral-600',
    'bg-neutral-800',
  ],
  theme: {
    extend: {
      colors: {
        // Custom color scale for returns
        'return-neg-5': '#991b1b', // -50%+
        'return-neg-4': '#b91c1c', // -40%
        'return-neg-3': '#dc2626', // -30%
        'return-neg-2': '#ef4444', // -20%
        'return-neg-1': '#f87171', // -10%
        'return-zero': '#525252',  // 0%
        'return-pos-1': '#4ade80', // +10%
        'return-pos-2': '#22c55e', // +20%
        'return-pos-3': '#16a34a', // +30%
        'return-pos-4': '#15803d', // +40%
        'return-pos-5': '#166534', // +50%+
      },
    },
  },
  plugins: [],
}
export default config
