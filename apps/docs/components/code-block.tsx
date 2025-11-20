'use client'

import React, { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CodeBlockProps {
  children: React.ReactNode
  className?: string
  language?: string
}

export function CodeBlock({ children, className = '', language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const preRef = React.useRef<HTMLPreElement>(null)

  const copyToClipboard = async () => {
    try {
      // Get text directly from the DOM to avoid span nesting issues
      const codeElement = preRef.current?.querySelector('code')
      if (codeElement) {
        // Use textContent to get plain text without HTML
        const text = codeElement.textContent || ''
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  // Extract language from className if not provided
  const detectedLanguage = language || className.match(/language-(\w+)/)?.[1] || 'shell'
  const displayLanguage = detectedLanguage.charAt(0).toUpperCase() + detectedLanguage.slice(1)

  return (
    <div className="group relative bg-black rounded-xl transition-colors">
      {/* Header bar with language and copy button */}
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-sm font-medium text-muted-foreground">
          {displayLanguage}
        </span>
        <button
          onClick={copyToClipboard}
          title="Copy code"
          className="p-2 rounded-md hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
        >
          {copied ? (
            <Check size={14} />
          ) : (
            <Copy size={14} />
          )}
        </button>
      </div>
      
      {/* Code content with full width */}
      <pre ref={preRef} className={`${className} rounded-none [&_code]:!select-text [&_code_span]:!select-text`}>
        {children}
      </pre>
    </div>
  )
}
