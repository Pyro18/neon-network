"use client"

/**
 * Hook personalizzati per la gestione del forum
 * 
 * Questo modulo fornisce una serie di hook React per interagire
 * con il sistema forum, inclusi:
 * - Recupero categorie, thread e post
 * - Creazione di nuovi contenuti
 * - Gestione like e segnalazioni
 * - Statistiche del forum
 */

import { useCallback, useEffect, useState } from 'react'
import {
  getForumCategories,
  getForumThreads,
  getRecentThreads,
  getThreadById,
  createThread,
  createPost,
  togglePostLike,
  reportContent,
  getForumStats,
  ForumCategory,
  ForumThread,
  ForumPost,
  ForumStats
} from '@/lib/forum'

/**
 * Hook per il recupero delle categorie del forum
 * @returns Oggetto con categorie, stato di caricamento ed eventuali errori
 */
export function useForumCategories() {
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const { data, error } = await getForumCategories()

        if (error) {
          throw error
        }

        if (data) {
          setCategories(data)
        }
      } catch (e) {
        console.error('Errore nel recupero categorie:', e)
        setError(e as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, isLoading, error }
}

/**
 * Hook per il recupero dei thread del forum con paginazione
 * @param options - Opzioni di filtro e paginazione
 * @returns Oggetto con thread, paginazione, stato di caricamento ed errori
 */
export function useForumThreads(options: {
  categoryId?: string
  page?: number
  limit?: number
  includeReplyCounts?: boolean
} = {}) {
  const [threads, setThreads] = useState<ForumThread[]>([])
  const [totalThreads, setTotalThreads] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const {
    categoryId,
    page = 1,
    limit = 10,
    includeReplyCounts = true
  } = options

  const fetchThreads = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await getForumThreads({
        categoryId,
        page,
        limit,
        includeReplyCounts
      })

      if (error) {
        throw error
      }

      if (data) {
        setThreads(data.threads)
        setTotalThreads(data.total)
      }
    } catch (e) {
      console.error('Errore nel recupero thread:', e)
      setError(e as Error)
    } finally {
      setIsLoading(false)
    }
  }, [categoryId, page, limit, includeReplyCounts])

  useEffect(() => {
    fetchThreads()
  }, [fetchThreads])

  return {
    threads,
    totalThreads,
    totalPages: Math.ceil(totalThreads / limit),
    currentPage: page,
    isLoading,
    error,
    refresh: fetchThreads
  }
}

/**
 * Hook per il recupero dei thread recenti
 * @param limit - Numero massimo di thread da recuperare
 * @returns Oggetto con thread recenti, stato di caricamento ed errori
 */
export function useRecentThreads(limit = 5) {
  const [threads, setThreads] = useState<ForumThread[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchRecentThreads = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const { data, error } = await getRecentThreads(limit)

        if (error) {
          throw error
        }

        if (data) {
          setThreads(data)
        }
      } catch (e) {
        console.error('Errore nel recupero thread recenti:', e)
        setError(e as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentThreads()
  }, [limit])

  return { threads, isLoading, error }
}

/**
 * Hook per il recupero delle statistiche del forum
 * @returns Oggetto con statistiche, stato di caricamento, errori e funzione refresh
 */
export function useForumStats() {
  const [stats, setStats] = useState<Partial<ForumStats>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchStats = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await getForumStats()

      if (error) {
        throw error
      }

      if (data) {
        setStats(data)
      }
    } catch (e) {
      console.error('Errore nel recupero statistiche forum:', e)
      setError(e as Error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, isLoading, error, refresh: fetchStats }
}

/**
 * Hook per il recupero di un singolo thread con i suoi post
 * @param threadId - ID del thread da recuperare
 * @returns Oggetto con thread, post, azioni e stato
 */
export function useThread(threadId: string) {
  const [thread, setThread] = useState<ForumThread | null>(null)
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchThread = useCallback(async () => {
    if (!threadId) return

    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await getThreadById(threadId)

      if (error) {
        throw error
      }

      if (data) {
        setThread(data.thread)
        setPosts(data.posts)
      }
    } catch (e) {
      console.error('Errore nel recupero thread:', e)
      setError(e as Error)
    } finally {
      setIsLoading(false)
    }
  }, [threadId])

  useEffect(() => {
    fetchThread()
  }, [fetchThread])

  const likePost = async (postId: string) => {
    try {
      const { data, error } = await togglePostLike(postId)

      if (error) {
        throw error
      }

      // Aggiorna l'array locale dei post con il nuovo stato del like
      if (data) {
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            const likeDelta = data.liked ? 1 : -1
            return {
              ...post,
              liked_by_current_user: data.liked,
              like_count: Math.max(0, (post.like_count || 0) + likeDelta)
            }
          }
          return post
        }))
      }

      return { success: true }
    } catch (e) {
      console.error('Errore nel mettere like al post:', e)
      return { success: false, error: e }
    }
  }

  const addReply = async (content: string) => {
    try {
      const { data, error } = await createPost({
        threadId,
        content
      })

      if (error) {
        throw error
      }

      // Se ha successo, aggiorna il thread per ottenere il nuovo post
      await fetchThread()

      return { success: true }
    } catch (e) {
      console.error('Errore nell\'aggiunta risposta:', e)
      return { success: false, error: e }
    }
  }

  const reportThreadOrPost = async (params: {
    contentType: 'thread' | 'post'
    contentId: string
    reason: string
    details?: string
  }) => {
    try {
      const { data, error } = await reportContent(params)

      if (error) {
        throw error
      }

      return { success: true, reportId: data?.reportId }
    } catch (e) {
      console.error('Errore nella segnalazione contenuto:', e)
      return { success: false, error: e }
    }
  }

  return {
    thread,
    posts,
    isLoading,
    error,
    refresh: fetchThread,
    likePost,
    addReply,
    reportThreadOrPost
  }
}

/**
 * Hook per la creazione di thread del forum
 * @returns Oggetto con funzione di creazione, stato di invio ed errori
 */
export function useCreateThread() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createNewThread = async (data: {
    title: string
    content: string
    categoryId: string
    isPinned?: boolean
    isLocked?: boolean
  }) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Usa l'endpoint API invece della funzione diretta
      const response = await fetch('/api/forum', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_thread',
          title: data.title,
          content: data.content,
          categoryId: data.categoryId,
          isPinned: data.isPinned || false,
          isLocked: data.isLocked || false,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Errore nella creazione del thread')
      }

      const result = await response.json()

      return { success: true, threadId: result.threadId }
    } catch (e) {
      console.error('Errore nella creazione thread:', e)
      const errorObj = e as Error
      setError(errorObj)
      return { success: false, error: errorObj }
    } finally {
      setIsSubmitting(false)
    }
  }

  return { createNewThread, isSubmitting, error }
}