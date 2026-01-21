'use client'

import { useState, useEffect } from 'react'
import { Plus, X, ShoppingCart } from 'lucide-react'
import { CategoryStats } from '../actions'

interface ShoppingListItem {
  id: string
  name: string
  category?: string
}

interface ShoppingListProps {
  areaStats: CategoryStats[]
}

const categoryKeywords: Record<string, string[]> = {
  卵: ['卵', 'たまご', '玉子', 'egg'],
  牛乳: ['牛乳', 'ぎゅうにゅう', 'ミルク', 'milk'],
  肉: ['肉', 'にく', 'meat', '牛肉', '豚肉', '鶏肉'],
  野菜: ['野菜', 'やさい', 'vegetable', 'キャベツ', 'にんじん', 'たまねぎ', 'トマト'],
  冷凍食品: ['冷凍', 'れいとう', 'frozen', '冷凍食品', '冷凍野菜', '冷凍肉', '冷凍ごはん', '冷凍ピザ', '冷凍うどん', '冷凍パン'],
  その他: ['その他', 'other'],
}

const detectCategory = (itemName: string): string | null => {
  const lowerName = itemName.toLowerCase()
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerName.includes(keyword.toLowerCase()))) {
      return category
    }
  }
  
  return null
}

export function ShoppingList({ areaStats }: ShoppingListProps) {
  const [items, setItems] = useState<ShoppingListItem[]>([])
  const [newItem, setNewItem] = useState('')

  // localStorageから読み込み
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const stored = localStorage.getItem('kau_shiru_shopping_list')
    if (stored) {
      try {
        setItems(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse shopping list:', e)
      }
    }
  }, [])

  // localStorageに保存
  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem('kau_shiru_shopping_list', JSON.stringify(items))
  }, [items])

  const handleAddItem = () => {
    if (!newItem.trim()) return

    const category = detectCategory(newItem.trim())
    const newListItem: ShoppingListItem = {
      id: crypto.randomUUID(),
      name: newItem.trim(),
      category: category || undefined,
    }

    setItems([...items, newListItem])
    setNewItem('')
  }

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const getPriceGuide = (category: string | undefined): number | null => {
    if (!category) return null
    const stat = areaStats.find(s => s.item_category === category)
    return stat ? stat.min_price : null
  }

  return (
    <div className="mb-6 p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingCart className="w-5 h-5 text-emerald-600" />
        <h2 className="text-lg font-bold text-gray-800">今日の買い物リスト</h2>
      </div>

      {/* 入力欄 */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAddItem()
            }
          }}
          placeholder="例：牛乳、卵..."
          className="flex-1 p-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />
        <button
          onClick={handleAddItem}
          className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* リスト */}
      {items.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">
          買い物リストは空です
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const priceGuide = getPriceGuide(item.category)
            
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200"
              >
                <div className="flex-1">
                  <span className="text-gray-800 font-medium">{item.name}</span>
                  {priceGuide && (
                    <span className="ml-3 text-xs text-emerald-600 font-medium">
                      このあたりでは、¥{priceGuide.toLocaleString()}くらいがお得感あり
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="削除"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
