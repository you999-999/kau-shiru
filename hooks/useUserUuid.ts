'use client'

import { useState, useEffect } from 'react'

const UUID_STORAGE_KEY = 'kau_shiru_user_uuid'

export function useUserUuid(): string | null {
  const [uuid, setUuid] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // localStorageから取得を試みる
    const stored = localStorage.getItem(UUID_STORAGE_KEY)
    
    if (stored) {
      setUuid(stored)
    } else {
      // 新規UUIDを生成して保存
      const newUuid = crypto.randomUUID()
      localStorage.setItem(UUID_STORAGE_KEY, newUuid)
      setUuid(newUuid)
    }
  }, [])

  return uuid
}
