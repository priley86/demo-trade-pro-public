'use client'

import React, { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CodeBlockProps {
  children: React.ReactNode
  className?: string
}

export function CodeBlock({ children, className = '' }: CodeBlockProps) {
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

  return (
    <div className="relative group">
      <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 px-2 py-1 bg-gray-800 text-gray-200 rounded text-sm hover:bg-gray-700 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={14} />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className={`${className} pr-20`}>
        <code>{children}</code>
      </pre>
    </div>
  )
}
