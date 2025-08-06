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

  // Extract the code text from children
  const getCodeText = (element: React.ReactNode): string => {
    if (typeof element === 'string') {
      return element
    }
    if (typeof element === 'number') {
      return element.toString()
    }
    if (React.isValidElement(element) && element.props && typeof element.props === 'object' && element.props !== null && 'children' in element.props) {
      const children = (element.props as { children: React.ReactNode }).children
      if (Array.isArray(children)) {
        return children.map(getCodeText).join('')
      }
      return getCodeText(children)
    }
    if (Array.isArray(element)) {
      return element.map(getCodeText).join('')
    }
    return ''
  }

  const codeText = getCodeText(children)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(codeText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
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
      <pre className={`${className} rounded-none`}>
        <code>{children}</code>
      </pre>
    </div>
  )
}
