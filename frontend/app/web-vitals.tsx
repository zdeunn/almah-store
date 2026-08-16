// app/web-vitals.tsx
'use client'

import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    if (metric.name === 'CLS' || metric.name === 'INP') {
      const color = 
        metric.rating === 'good' ? '🟢' : 
        metric.rating === 'needs-improvement' ? '🟡' : '🔴'

      console.groupCollapsed(`${color} [Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`)
      console.log('Metric Details:', {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
      })
      console.groupEnd()
    }
  })

  return null
}