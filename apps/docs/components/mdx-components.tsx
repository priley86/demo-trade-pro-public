import { MDXComponents } from 'mdx/types'
import { CodeBlock } from './code-block'
import { Mermaid } from './mermaid'
import React from 'react'

export const mdxComponents: MDXComponents = {
  // Enhanced code blocks with copy functionality
  pre: ({ children }: React.HTMLAttributes<HTMLPreElement>) => {
    // Check if this is a mermaid diagram
    const codeElement = React.isValidElement(children) ? children.props as { className?: string; children?: string } : null
    const language = codeElement?.className?.replace('language-', '') || ''
    
    if (language === 'mermaid') {
      const chartCode = codeElement?.children || ''
      return <Mermaid chart={chartCode} />
    }
    
    // Regular code block with copy button
    return (
      <CodeBlock className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm leading-relaxed">
        {children}
      </CodeBlock>
    )
  },
  
  // Style other elements for better workshop experience
  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-3xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-4" {...props}>
      {children}
    </h1>
  ),
  
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-2xl font-semibold mb-4 mt-8 text-gray-800" {...props}>
      {children}
    </h2>
  ),
  
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-xl font-semibold mb-3 mt-6 text-gray-800" {...props}>
      {children}
    </h3>
  ),
  
  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-4 text-gray-700 leading-relaxed" {...props}>
      {children}
    </p>
  ),
  
  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="mb-4 ml-6 list-disc text-gray-700 space-y-1" {...props}>
      {children}
    </ul>
  ),
  
  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="mb-4 ml-6 list-decimal text-gray-700 space-y-1" {...props}>
      {children}
    </ol>
  ),
  
  li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="leading-relaxed" {...props}>
      {children}
    </li>
  ),
  
  blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-4 bg-blue-50 text-blue-800 italic" {...props}>
      {children}
    </blockquote>
  ),
  
  strong: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-gray-900" {...props}>
      {children}
    </strong>
  ),
  
  code: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono" {...props}>
      {children}
    </code>
  ),
  
  a: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a 
      className="text-blue-600 hover:text-blue-800 underline decoration-blue-600/30 hover:decoration-blue-800"
      href={href}
      {...props}
    >
      {children}
    </a>
  ),
  
  table: ({ children, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto mb-6">
      <table className="min-w-full divide-y divide-gray-300" {...props}>
        {children}
      </table>
    </div>
  ),
  
  thead: ({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-gray-50" {...props}>
      {children}
    </thead>
  ),
  
  th: ({ children, ...props }: React.ThHTMLAttributes<HTMLTableHeaderCellElement>) => (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props}>
      {children}
    </th>
  ),
  
  td: ({ children, ...props }: React.TdHTMLAttributes<HTMLTableDataCellElement>) => (
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" {...props}>
      {children}
    </td>
  ),
}
