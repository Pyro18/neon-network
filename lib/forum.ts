import { createClient } from '@/lib/supabase'
import { PostgrestError, SupabaseClient } from '@supabase/supabase-js'

/**
 * Types representing the database schema
 */

export type ForumCategory = {
  id: string
  name: string
  description: string
  icon: string
  sort_order: number
  color: string
  created_at: string
  updated_at: string
}

export type ForumThread = {
  id: string
  title: string
  category_id: string
  author_id: string
  is_pinned: boolean
  is_locked: boolean
  views: number
  created_at: string
  updated_at: string
  category?: ForumCategory
  author?: ForumUser
  reply_count?: number
}

export type ForumPost = {
  id: string
  thread_id: string
  author_id: string
  content: string
  is_original_post: boolean
  created_at: string
  updated_at: string
  author?: ForumUser
  likes?: number
  liked_by_current_user?: boolean
}

export type ForumUser = {
  id: string
  username: string
  avatar_url: string
  role: string
  join_date: string
  post_count: number
}

export type ForumStats = {
  total_threads: number
  total_posts: number
  total_members: number
  newest_member?: ForumUser
  active_user_count: number
  todays_posts: number
}

/**
 * Error handling helpers
 */

type Result<T> = {
  data: T | null
  error: Error | PostgrestError | null
}

/**
 * Forum API functions
 */

export async function getForumCategories(): Promise<Result<ForumCategory[]>> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('forum_categories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error fetching forum categories:', error)
    return { data: null, error: error as Error | PostgrestError }
  }
}

export async function getForumThreads(
  options: {
    categoryId?: string
    page?: number
    limit?: number
    includeReplyCounts?: boolean
  } = {}
): Promise<Result<{ threads: ForumThread[], total: number }>> {
  const {
    categoryId,
    page = 1,
    limit = 10,
    includeReplyCounts = true
  } = options

  const supabase = createClient()
  const offset = (page - 1) * limit

  try {
    let query = supabase
      .from('forum_threads')
      .select(`
        *,
        category:forum_categories(*),
        author:profiles(id, username, avatar_url, role)
      `, { count: 'exact' })

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    // Get threads with pagination
    const { data: threads, error, count } = await query
      .order('is_pinned', { ascending: false })
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // If we need reply counts, fetch them
    if (includeReplyCounts && threads) {
      const threadsWithReplyCounts = await addReplyCountsToThreads(supabase, threads)
      return {
        data: {
          threads: threadsWithReplyCounts,
          total: count || threadsWithReplyCounts.length
        },
        error: null
      }
    }

    return {
      data: {
        threads: threads || [],
        total: count || 0
      },
      error: null
    }
  } catch (error) {
    console.error('Error fetching forum threads:', error)
    return { data: null, error: error as Error | PostgrestError }
  }
}

export async function getRecentThreads(limit = 5): Promise<Result<ForumThread[]>> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('forum_threads')
      .select(`
        *,
        category:forum_categories(id, name),
        author:profiles(id, username, avatar_url, role)
      `)
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    // Add reply counts to each thread
    if (data) {
      const threadsWithReplyCounts = await addReplyCountsToThreads(supabase, data)
      return { data: threadsWithReplyCounts, error: null }
    }

    return { data: [], error: null }
  } catch (error) {
    console.error('Error fetching recent threads:', error)
    return { data: null, error: error as Error | PostgrestError }
  }
}

export async function getThreadById(threadId: string): Promise<Result<{ thread: ForumThread, posts: ForumPost[] }>> {
  const supabase = createClient()

  try {
    // Fetch the thread with its category and author
    const { data: thread, error: threadError } = await supabase
      .from('forum_threads')
      .select(`
        *,
        category:forum_categories(*),
        author:profiles(id, username, avatar_url, role, created_at, post_count)
      `)
      .eq('id', threadId)
      .single()

    if (threadError) throw threadError

    // Increment view count
    await supabase
      .rpc('increment_thread_view', { thread_id: threadId })

    // Fetch the posts for this thread
    const { data: posts, error: postsError } = await supabase
      .from('forum_posts')
      .select(`
        *,
        author:profiles(id, username, avatar_url, role, created_at, post_count)
      `)
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })

    if (postsError) throw postsError

    // Get the current user to check if they liked any posts
    const { data: { session } } = await supabase.auth.getSession()
    const currentUserId = session?.user?.id

    // If we have a logged in user, check which posts they've liked
    if (currentUserId && posts) {
      const { data: likes } = await supabase
        .from('forum_post_likes')
        .select('post_id')
        .eq('user_id', currentUserId)

      const likedPostIds = likes?.map(like => like.post_id) || []

      // Add the liked_by_current_user flag to each post
      posts.forEach(post => {
        post.liked_by_current_user = likedPostIds.includes(post.id)
      })
    }

    // Get like counts for each post
    if (posts) {
      const postIds = posts.map(post => post.id)
      // Use proper Supabase query for counting
      for (const post of posts) {
        const { count } = await supabase
          .from('forum_post_likes')
          .select('*', { count: 'exact' })
          .eq('post_id', post.id);

        post.likes = count || 0;
      }
    }

    return {
      data: {
        thread,
        posts: posts || []
      },
      error: null
    }
  } catch (error) {
    console.error('Error fetching thread by id:', error)
    return { data: null, error: error as Error | PostgrestError }
  }
}

export async function createThread(
  data: {
    title: string
    content: string
    categoryId: string
    isPinned?: boolean
    isLocked?: boolean
  }
): Promise<Result<{ threadId: string }>> {
  const supabase = createClient()

  // Get the current user session
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    return { data: null, error: new Error('You must be logged in to create a thread') }
  }

  // Start a transaction using a stored procedure
  try {
    const { data: result, error } = await supabase
      .rpc('create_thread_with_post', {
        p_title: data.title,
        p_content: data.content,
        p_category_id: data.categoryId,
        p_is_pinned: data.isPinned || false,
        p_is_locked: data.isLocked || false
      })

    if (error) throw error

    return { data: { threadId: result }, error: null }
  } catch (error) {
    console.error('Error creating thread:', error)
    return { data: null, error: error as Error | PostgrestError }
  }
}

export async function createPost(
  data: {
    threadId: string
    content: string
  }
): Promise<Result<ForumPost>> {
  const supabase = createClient()

  // Get the current user session
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    return { data: null, error: new Error('You must be logged in to create a post') }
  }

  try {
    // First check if the thread is locked
    const { data: thread, error: threadError } = await supabase
      .from('forum_threads')
      .select('is_locked')
      .eq('id', data.threadId)
      .single()

    if (threadError) throw threadError

    if (thread.is_locked) {
      return { data: null, error: new Error('This thread is locked and cannot receive new replies') }
    }

    // Create the post
    const { data: post, error } = await supabase
      .from('forum_posts')
      .insert({
        thread_id: data.threadId,
        author_id: session.user.id,
        content: data.content,
        is_original_post: false
      })
      .select('*')
      .single()

    if (error) throw error

    // Update the thread's updated_at timestamp
    await supabase
      .from('forum_threads')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', data.threadId)

    // Increment the user's post count
    await supabase
      .rpc('increment_user_post_count', { user_id: session.user.id })

    return { data: post, error: null }
  } catch (error) {
    console.error('Error creating post:', error)
    return { data: null, error: error as Error | PostgrestError }
  }
}

export async function togglePostLike(postId: string): Promise<Result<{ liked: boolean }>> {
  const supabase = createClient()

  // Get the current user session
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    return { data: null, error: new Error('You must be logged in to like a post') }
  }

  try {
    // Check if the user has already liked this post
    const { data: existingLike, error: checkError } = await supabase
      .from('forum_post_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', session.user.id)
      .maybeSingle()

    if (checkError) throw checkError

    if (existingLike) {
      // User already liked this post, so remove the like
      const { error: unlikeError } = await supabase
        .from('forum_post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', session.user.id)

      if (unlikeError) throw unlikeError

      return { data: { liked: false }, error: null }
    } else {
      // User hasn't liked this post yet, so add a like
      const { error: likeError } = await supabase
        .from('forum_post_likes')
        .insert({
          post_id: postId,
          user_id: session.user.id
        })

      if (likeError) throw likeError

      return { data: { liked: true }, error: null }
    }
  } catch (error) {
    console.error('Error toggling post like:', error)
    return { data: null, error: error as Error | PostgrestError }
  }
}

export async function reportContent(
  data: {
    contentType: 'thread' | 'post'
    contentId: string
    reason: string
    details?: string
  }
): Promise<Result<{ reportId: string }>> {
  const supabase = createClient()

  // Get the current user session
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    return { data: null, error: new Error('You must be logged in to report content') }
  }

  try {
    const { data: report, error } = await supabase
      .from('forum_reports')
      .insert({
        reporter_id: session.user.id,
        content_type: data.contentType,
        content_id: data.contentId,
        reason: data.reason,
        details: data.details || null,
        status: 'pending'
      })
      .select('id')
      .single()

    if (error) throw error

    return { data: { reportId: report.id }, error: null }
  } catch (error) {
    console.error('Error reporting content:', error)
    return { data: null, error: error as Error | PostgrestError }
  }
}

export async function getForumStats(): Promise<Result<ForumStats>> {
  const supabase = createClient()

  try {
    // Query for forum statistics
    const { data, error } = await supabase
      .rpc('get_forum_stats')

    if (error) throw error

    // Get the newest member
    const { data: newestMember, error: memberError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, role, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (memberError && memberError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw memberError
    }

    // Get active user count
    const { count: activeUserCount, error: activeError } = await supabase
      .from('user_sessions')
      .select('*', { count: 'exact' })
      .gt('last_seen_at', new Date(Date.now() - 15 * 60 * 1000).toISOString()) // active in last 15 minutes

    if (activeError) throw activeError

    // Get today's post count
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { count: todaysPosts, error: todaysError } = await supabase
      .from('forum_posts')
      .select('*', { count: 'exact' })
      .gte('created_at', today.toISOString())

    if (todaysError) throw todaysError

    return {
      data: {
        total_threads: data.total_threads || 0,
        total_posts: data.total_posts || 0,
        total_members: data.total_members || 0,
        newest_member: newestMember ? {
          id: newestMember.id,
          username: newestMember.username,
          avatar_url: newestMember.avatar_url,
          role: newestMember.role,
          join_date: newestMember.created_at,
          post_count: 0 // Default value since we don't have this info
        } : undefined,
        active_user_count: activeUserCount || 0,
        todays_posts: todaysPosts || 0
      },
      error: null
    }
  } catch (error) {
    console.error('Error fetching forum stats:', error)
    return { data: null, error: error as Error | PostgrestError }
  }
}

/**
 * Helper functions
 */

async function addReplyCountsToThreads(
  supabase: SupabaseClient,
  threads: ForumThread[]
): Promise<ForumThread[]> {
  if (!threads.length) return threads

  // Get the thread IDs
  const threadIds = threads.map(thread => thread.id)

  // Query for post counts
  const postCounts: Array<{ thread_id: string, count: string }> = [];

  // Count posts for each thread individually
  for (const thread of threads) {
    const { count } = await supabase
      .from('forum_posts')
      .select('*', { count: 'exact' })
      .eq('thread_id', thread.id);

    if (count !== null) {
      postCounts.push({ thread_id: thread.id, count: count.toString() });
    }
  }

  // Create a map of thread ID to reply count
  const replyCountMap = new Map<string, number>()
  postCounts.forEach((item: { thread_id: string, count: string }) => {
    // Subtract 1 from the count to get the reply count (excluding the original post)
    const count = parseInt(item.count) - 1
    replyCountMap.set(item.thread_id, count > 0 ? count : 0)
  })

  // Add the reply count to each thread
  return threads.map(thread => ({
    ...thread,
    reply_count: replyCountMap.get(thread.id) || 0
  }))
}