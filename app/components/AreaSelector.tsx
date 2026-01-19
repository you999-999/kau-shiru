'use client'

import { useState, useEffect } from 'react'
import { MapPin } from 'lucide-react'

const AREA_STORAGE_KEY = 'kau_shiru_selected_area'

const areas = [
  { value: '愛知西部', label: '愛知西部' },
  { value: '愛知東部', label: '愛知東部' },
  { value: '名古屋市', label: '名古屋市' },
  { value: 'その他', label: 'その他' },
]

interface AreaSelectorProps {
  onAreaChange?: (area: string) => void
}

export function AreaSelector({ onAreaChange }: AreaSelectorProps) {
  const [selectedArea, setSelectedArea] = useState<string>('愛知西部')

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const stored = localStorage.getItem(AREA_STORAGE_KEY)
    if (stored) {
      setSelectedArea(stored)
      onAreaChange?.(stored)
    } else {
      onAreaChange?.(selectedArea)
    }
  }, [])

  const handleChange = (area: string) => {
    setSelectedArea(area)
    if (typeof window !== 'undefined') {
      localStorage.setItem(AREA_STORAGE_KEY, area)
    }
    onAreaChange?.(area)
  }

  return (
    <div className="flex items-center gap-2">
      <MapPin className="w-4 h-4 text-gray-600" />
      <select
        value={selectedArea}
        onChange={(e) => handleChange(e.target.value)}
        className="text-sm font-medium text-gray-700 bg-transparent border-none focus:outline-none cursor-pointer"
      >
        {areas.map((area) => (
          <option key={area.value} value={area.value}>
            {area.label}
          </option>
        ))}
      </select>
    </div>
  )
}
