"use client"

/**
 * Context Provider per il sistema Forum
 * 
 * Gestisce lo stato globale del forum:
 * - Cache delle categorie e thread recenti
 * - Statistiche in tempo reale
 * - Stato di caricamento condiviso
 * - Refresh automatico dei dati
 * - Performance optimization con memorizzazione
 */

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { 
  ForumCategory, 
  ForumThread, 
  ForumStats,
  getForumCategories,
  getForumStats
} from '@/lib/forum'

/**
 * Tipo per il context del forum
 */
interface ForumContextType {
  categories: ForumCategory[]
  recentThreads: ForumThread[]
  stats: Partial<ForumStats>
  isLoading: boolean
  setCachedCategories: (categories: ForumCategory[]) => void
  setCachedRecentThreads: (threads: ForumThread[]) => void
  setCachedStats: (stats: Partial<ForumStats>) => void
  refreshStats: () => Promise<void>
}

const ForumContext = createContext<ForumContextType | undefined>(undefined)

/**
 * Provider React Context per il forum
 */
export function ForumProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [recentThreads, setRecentThreads] = useState<ForumThread[]>([])
  const [stats, setStats] = useState<Partial<ForumStats>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch dati iniziali del forum
    const fetchInitialData = async () => {
      setIsLoading(true)
      try {
        // Fetch categorie
        const { data: categoriesData } = await getForumCategories()
        if (categoriesData) {
          setCategories(categoriesData)
        }
        
        // Fetch statistiche
        const { data: statsData } = await getForumStats()
        if (statsData) {
          setStats(statsData)
        }
      } catch (error) {
        console.error('Error fetching forum data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  const setCachedCategories = (categories: ForumCategory[]) => {
    setCategories(categories)
  }

  const setCachedRecentThreads = (threads: ForumThread[]) => {
    setRecentThreads(threads)
  }

  const setCachedStats = (stats: Partial<ForumStats>) => {
    setStats(prevStats => ({ ...prevStats, ...stats }))
  }

  const refreshStats = async () => {
    try {
      const { data } = await getForumStats()
      if (data) {
        setStats(data)
      }
    } catch (error) {
      console.error('Error refreshing forum stats:', error)
    }
  }

  const value = {
    categories,
    recentThreads,
    stats,
    isLoading,
    setCachedCategories,
    setCachedRecentThreads,
    setCachedStats,
    refreshStats
  }

  return (
    <ForumContext.Provider value={value}>
      {children}
    </ForumContext.Provider>
  )
}

export function useForumContext() {
  const context = useContext(ForumContext)
  if (context === undefined) {
    throw new Error('useForumContext must be used within a ForumProvider')
  }
  return context
}