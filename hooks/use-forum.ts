"use client"

/**
 * Custom hooks for interacting with forum data
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
 * Hook for fetching forum categories
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
        console.error('Error fetching categories:', e)
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
 * Hook for fetching forum threads with pagination
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
      console.error('Error fetching threads:', e)
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
 * Hook for fetching recent threads
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
        console.error('Error fetching recent threads:', e)
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
 * Hook for fetching a single thread with its posts
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
      console.error('Error fetching thread:', e)
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
      
      // Update the local posts array with the new like status
      if (data) {
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            const likeDelta = data.liked ? 1 : -1
            return {
              ...post,
              liked_by_current_user: data.liked,
              likes: (post.likes || 0) + likeDelta
            }
          }
          return post
        }))
      }
      
      return { success: true }
    } catch (e) {
      console.error('Error liking post:', e)
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
      
      // If successful, refresh the thread to get the new post
      await fetchThread()
      
      return { success: true }
    } catch (e) {
      console.error('Error adding reply:', e)
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
      console.error('Error reporting content:', e)
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
 * Hook for forum thread creation
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
      // Use the API endpoint instead of the direct function
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
        throw new Error(errorData.message || 'Failed to create thread')
      }

      const result = await response.json()

      return { success: true, threadId: result.threadId }
    } catch (e) {
      console.error('Error creating thread:', e)
      const errorObj = e as Error
      setError(errorObj)
      return { success: false, error: errorObj }
    } finally {
      setIsSubmitting(false)
    }
  }

  return { createNewThread, isSubmitting, error }
}