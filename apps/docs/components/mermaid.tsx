'use client'

import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

interface MermaidProps {
  chart: string
  id?: string
}

export function Mermaid({ chart, id }: MermaidProps) {
  // Generate a valid CSS selector ID without dots
  const safeId = id || `mermaid-${Date.now()}-${Math.floor(Math.random() * 10000)}`
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initialize mermaid with custom config
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
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
          ref.current.innerHTML = `
            <div class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              <strong>Mermaid Error:</strong> Failed to render diagram
              <pre class="mt-2 text-sm">${error}</pre>
            </div>
          `
        }
      }
    }

    renderChart()
  }, [chart, safeId])

  return (
    <div className="my-6 p-4 bg-gray-50 rounded-lg border overflow-x-auto">
      <div ref={ref} className="mermaid-container" />
    </div>
  )
}
