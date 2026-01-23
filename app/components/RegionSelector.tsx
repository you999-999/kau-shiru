'use client'

import { useState, useEffect, useMemo } from 'react'
import { MapPin, Search, X } from 'lucide-react'
import { REGION_BIG_OPTIONS, getPrefectures, getCities, DEFAULT_REGION, getDefaultRegionForArea } from '../data/regions'

const REGION_STORAGE_KEY = 'kau_shiru_selected_region'

export interface RegionData {
  big: string
  prefecture?: string
  city?: string
}

interface RegionSelectorProps {
  value?: RegionData
  onChange?: (region: RegionData) => void
  className?: string
}

export function RegionSelector({ value, onChange, className = '' }: RegionSelectorProps) {
  const [regionBig, setRegionBig] = useState<string>(DEFAULT_REGION.big)
  const [regionPref, setRegionPref] = useState<string>(DEFAULT_REGION.prefecture)
  const [regionCity, setRegionCity] = useState<string>(DEFAULT_REGION.city)
  const [citySearch, setCitySearch] = useState<string>('')
  const [showCityDropdown, setShowCityDropdown] = useState(false)

  // localStorageから初期値を読み込み
  useEffect(() => {
    if (typeof window === 'undefined') return

    const stored = localStorage.getItem(REGION_STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as RegionData
        const big = parsed.big || DEFAULT_REGION.big
        setRegionBig(big)
        // 都道府県・市町村が設定されている場合はそれを使用、なければ地域のデフォルト値を使用
        if (parsed.prefecture && parsed.city) {
          setRegionPref(parsed.prefecture)
          setRegionCity(parsed.city)
        } else {
          // 地域のみ設定されている場合は、その地域の最大人口都道府県・市町村を設定
          const defaults = getDefaultRegionForArea(big as any)
          setRegionPref(defaults.prefecture)
          setRegionCity(defaults.city)
        }
      } catch (e) {
        // パースエラー時はデフォルト値を使用
        const defaults = getDefaultRegionForArea(DEFAULT_REGION.big as any)
        setRegionBig(DEFAULT_REGION.big)
        setRegionPref(defaults.prefecture)
        setRegionCity(defaults.city)
      }
    } else {
      // localStorageに保存されていない場合も、デフォルト地域のデフォルト値を設定
      const defaults = getDefaultRegionForArea(DEFAULT_REGION.big as any)
      setRegionBig(DEFAULT_REGION.big)
      setRegionPref(defaults.prefecture)
      setRegionCity(defaults.city)
    }
  }, [])

  // 外部からvalueが渡された場合はそれを使用
  useEffect(() => {
    if (value) {
      setRegionBig(value.big || DEFAULT_REGION.big)
      setRegionPref(value.prefecture || DEFAULT_REGION.prefecture)
      setRegionCity(value.city || DEFAULT_REGION.city)
    }
  }, [value])

  // 都道府県一覧
  const prefectures = useMemo(() => {
    return getPrefectures(regionBig as any) || []
  }, [regionBig])

  // 市町村一覧（検索フィルタリング済み）
  const cities = useMemo(() => {
    if (!regionPref) return []
    const allCities = getCities(regionBig as any, regionPref) || []
    if (!citySearch) return allCities
    return allCities.filter(city => 
      city.toLowerCase().includes(citySearch.toLowerCase())
    )
  }, [regionBig, regionPref, citySearch])

  // 地域変更時の処理
  const handleRegionBigChange = (newBig: string) => {
    setRegionBig(newBig)
    // 地域に応じたデフォルト都道府県・市町村を設定
    const defaults = getDefaultRegionForArea(newBig as any)
    setRegionPref(defaults.prefecture)
    setRegionCity(defaults.city)
    setCitySearch('')
    updateRegion({ big: newBig, prefecture: defaults.prefecture, city: defaults.city })
  }

  // 都道府県変更時の処理
  const handlePrefectureChange = (newPref: string) => {
    setRegionPref(newPref)
    setRegionCity('')
    setCitySearch('')
    updateRegion({ big: regionBig, prefecture: newPref })
  }

  // 市町村選択時の処理
  const handleCitySelect = (city: string) => {
    setRegionCity(city)
    setCitySearch('')
    setShowCityDropdown(false)
    updateRegion({ big: regionBig, prefecture: regionPref, city })
  }

  // 地域情報を更新してlocalStorageに保存し、onChangeを呼び出す
  const updateRegion = (region: RegionData) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(REGION_STORAGE_KEY, JSON.stringify(region))
    }
    onChange?.(region)
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <MapPin className="w-4 h-4 text-gray-600 flex-shrink-0" />
      
      {/* 地域（必須） */}
      <select
        value={regionBig}
        onChange={(e) => handleRegionBigChange(e.target.value)}
        className="text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
      >
        {REGION_BIG_OPTIONS.map((region) => (
          <option key={region} value={region}>
            {region}
          </option>
        ))}
      </select>

      {/* 都道府県（任意） */}
      {prefectures.length > 0 && (
        <select
          value={regionPref || ''}
          onChange={(e) => handlePrefectureChange(e.target.value)}
          className="text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="">都道府県を選択</option>
          {prefectures.map((pref) => (
            <option key={pref} value={pref}>
              {pref}
            </option>
          ))}
        </select>
      )}

      {/* 市町村（任意・検索可能） */}
      {regionPref && cities.length > 0 && (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={citySearch}
              onChange={(e) => {
                setCitySearch(e.target.value)
                setShowCityDropdown(true)
              }}
              onFocus={() => setShowCityDropdown(true)}
              placeholder="市町村を検索..."
              className="text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg pl-8 pr-8 py-1.5 focus:outline-none focus:border-emerald-500 w-40"
            />
            {citySearch && (
              <button
                onClick={() => {
                  setCitySearch('')
                  setShowCityDropdown(false)
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* 市町村ドロップダウン */}
          {showCityDropdown && cities.length > 0 && (
            <div className="absolute z-50 mt-1 w-40 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => handleCitySelect(city)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 transition-colors ${
                    regionCity === city ? 'bg-emerald-100 font-medium' : ''
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 選択中の地域表示（デバッグ用・必要に応じて削除） */}
      {regionCity && (
        <span className="text-xs text-gray-500">
          📍 {regionBig}{regionPref && `／${regionPref}`}{regionCity && `／${regionCity}`}
        </span>
      )}
    </div>
  )
}
