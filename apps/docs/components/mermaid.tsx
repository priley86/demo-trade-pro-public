'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import mermaid from 'mermaid'

interface MermaidProps {
  chart: string
  id?: string
}

export function Mermaid({ chart, id }: MermaidProps) {
  const { theme, resolvedTheme } = useTheme()
  // Generate a valid CSS selector ID without dots
  const safeId = id || `mermaid-${Date.now()}-${Math.floor(Math.random() * 10000)}`
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Determine the mermaid theme based on the current theme
    const currentTheme = resolvedTheme || theme
    const mermaidTheme = currentTheme === 'dark' ? 'dark' : 'default'
    
    // Initialize mermaid with theme-aware config
    mermaid.initialize({
      startOnLoad: false,
      theme: mermaidTheme,
      securityLevel: 'loose',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
      },
      sequence: {
        useMaxWidth: true,
        wrap: true,
      },
      gitGraph: {
        useMaxWidth: true,
      },
    })

    const renderChart = async () => {
      if (ref.current) {
        try {
          // Clear any previous content
          ref.current.innerHTML = ''
          
          // Render the chart
          const { svg } = await mermaid.render(safeId, chart)
          ref.current.innerHTML = svg
          
          // Style the SVG for better appearance
          const svgElement = ref.current.querySelector('svg')
          if (svgElement) {
            svgElement.style.maxWidth = '100%'
            svgElement.style.height = 'auto'
          }
        } catch (error) {
          console.error('Mermaid rendering error:', error)
          const isDark = currentTheme === 'dark'
          ref.current.innerHTML = `
            <div class="p-4 ${isDark ? 'bg-red-950 border-red-800 text-red-200' : 'bg-red-50 border-red-200 text-red-800'} border rounded-lg">
              <strong>Mermaid Error:</strong> Failed to render diagram
              <pre class="mt-2 text-sm">${error}</pre>
            </div>
          `
        }
      }
    }

    renderChart()
  }, [chart, safeId, theme, resolvedTheme])

  return (
    <div className="my-6 p-4 bg-muted rounded-lg border overflow-x-auto">
      <div ref={ref} className="mermaid-container" />
    </div>
  )
}
