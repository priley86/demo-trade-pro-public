import createMDX from '@next/mdx'
import rehypePrettyCode from 'rehype-pretty-code'

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [
      [rehypePrettyCode, {
        theme: "github-dark-dimmed",
        keepBackground: false,
        defaultLang: 'shell',
      }]
    ],
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure `pageExtensions` to include MDX files
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  transpilePackages: ['@workspace/ui'],
  // Optionally, add any other Next.js config below
}

export default withMDX(nextConfig)