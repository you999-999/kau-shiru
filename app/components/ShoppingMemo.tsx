'use client'

import { useState, useEffect } from 'react'
import { Plus, X, ShoppingCart, Check } from 'lucide-react'

interface ShoppingMemoItem {
  id: string
  name: string
  checked: boolean
}

const STORAGE_KEY = 'kau_shiru_shopping_memo'

export function ShoppingMemo() {
  const [items, setItems] = useState<ShoppingMemoItem[]>([])
  const [newItem, setNewItem] = useState('')

  // localStorageから読み込み
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setItems(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse shopping memo:', e)
      }
    }
  }, [])

  // localStorageに保存
  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const handleAddItem = () => {
    if (!newItem.trim()) return

    const newListItem: ShoppingMemoItem = {
      id: crypto.randomUUID(),
      name: newItem.trim(),
      checked: false,
    }

    setItems([...items, newListItem])
    setNewItem('')
  }

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const handleToggleCheck = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ))
  }

  const handleClearChecked = () => {
    setItems(items.filter(item => !item.checked))
  }

  const checkedCount = items.filter(item => item.checked).length

  return (
    <div className="mb-6 p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingCart className="w-5 h-5 text-emerald-600" />
        <h2 className="text-lg font-bold text-gray-800">これから買うメモ</h2>
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
          placeholder="例：キャベツ、鶏もも..."
          className="flex-1 p-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 text-sm"
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
          買い物メモは空です
        </p>
      ) : (
        <>
          <div className="space-y-2 mb-3">
            {items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  item.checked 
                    ? 'bg-emerald-50 border-emerald-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => handleToggleCheck(item.id)}
                    className={`p-1 rounded-lg transition-all ${
                      item.checked 
                        ? 'text-emerald-600 bg-emerald-100' 
                        : 'text-gray-400 hover:text-emerald-500 hover:bg-emerald-50'
                    }`}
                  >
                    <Check className={`w-4 h-4 ${item.checked ? 'fill-current' : ''}`} />
                  </button>
                  <span className={`text-gray-800 font-medium flex-1 ${
                    item.checked ? 'line-through text-gray-500' : ''
                  }`}>
                    {item.name}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2"
                  title="削除"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          {checkedCount > 0 && (
            <button
              onClick={handleClearChecked}
              className="w-full py-2 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              チェック済みを削除 ({checkedCount}件)
            </button>
          )}
        </>
      )}
    </div>
  )
}
