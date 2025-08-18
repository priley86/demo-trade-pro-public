import React from 'react'

import { MDXComponents } from 'mdx/types'
import { CodeBlock } from './code-block'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@workspace/ui/components/tabs'
import { ExternalLink } from './external-link'
import { PlatformLink } from './platform-link'
import { Mermaid } from './mermaid'

export const mdxComponents: MDXComponents = {
  pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => {
    // Extract language from various possible sources that rehype-pretty-code might use
    let language: string | undefined;
    
    // Check data attributes
    const dataLanguage = (props as Record<string, unknown>)['data-language'] as string | undefined || (props as Record<string, unknown>)['data-lang'] as string | undefined;
    const className = (props as { className?: string }).className || '';
    
    // Try to extract language from className
    const classLanguage = className.match(/language-(\w+)/)?.[1];
    
    // Check if children has language info (rehype-pretty-code might put it on the code element)
    if (React.isValidElement(children) && children.props) {
      const childProps = children.props as Record<string, unknown>;
      const childClassName = (childProps.className as string) || '';
      const childDataLanguage = (childProps['data-language'] as string) || (childProps['data-lang'] as string);
      const childClassLanguage = childClassName.match(/language-(\w+)/)?.[1];
      language = childDataLanguage || childClassLanguage;
    }
    
    // Use the first available language source
    language = language || dataLanguage || classLanguage;
    
    return (
      <CodeBlock 
        className="mb-6 rounded-b-xl overflow-x-auto text-sm leading-relaxed p-4"
        language={language}
      >
        {children}
      </CodeBlock>
    );
  },
  
  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-4xl font-bold mb-8 text-foreground border-b border-border pb-6" {...props}>
      {children}
    </h1>
  ),
  
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-3xl font-semibold mb-6 mt-12 text-foreground" {...props}>
      {children}
    </h2>
  ),
  
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-2xl font-semibold mb-4 mt-8 text-foreground/90" {...props}>
      {children}
    </h3>
  ),
  
  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-6 text-foreground/85 leading-7 text-lg" {...props}>
      {children}
    </p>
  ),
  
  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="mb-6 ml-8 list-disc text-foreground/85 space-y-2 text-lg" {...props}>
      {children}
    </ul>
  ),
  
  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="mb-6 ml-8 list-decimal text-foreground/85 space-y-2 text-lg" {...props}>
      {children}
    </ol>
  ),
  
  li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="leading-7 text-lg" {...props}>
      {children}
    </li>
  ),
  
  blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="mb-6 border-l-4 border-primary/30 pl-6 py-2 text-foreground/80 italic text-lg leading-7 bg-muted/20" {...props}>
      {children}
    </blockquote>
  ),
  
  strong: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-foreground" {...props}>
      {children}
    </strong>
  ),
  
  code: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code className="bg-black text-foreground text-sm font-mono" {...props}>
      {children}
    </code>
  ),
  
  a: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a 
      className="text-primary hover:text-primary/80 underline decoration-primary/30 hover:decoration-primary/80"
      href={href}
      {...props}
    >
      {children}
    </a>
  ),
  
  table: ({ children, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto mb-6 border border-border rounded-lg">
      <table className="min-w-full divide-y divide-border" {...props}>
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
  
  // Tabs components
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  
  // Link components
  ExternalLink,
  PlatformLink,

  Mermaid,
}
