import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/forum?type=stats
 * GET /api/forum?type=categories
 * GET /api/forum?type=threads&categoryId=&page=&limit=
 * GET /api/forum?type=thread&id=
 * GET /api/forum?type=recent&limit=
 */
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get('type')

  try {
    switch (type) {
      case 'stats': {
        // Get forum statistics
        const { data, error } = await supabase.rpc('get_forum_stats')

        if (error) {
          throw new Error(`Error fetching forum stats: ${error.message}`)
        }

        // Get the newest member
        const { data: newestMember } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, role, created_at')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        // Get active user count
        const { count: activeUserCount } = await supabase
          .from('user_sessions')
          .select('*', { count: 'exact' })
          .gt('last_seen_at', new Date(Date.now() - 15 * 60 * 1000).toISOString())

        // Get today's post count
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const { count: todaysPosts } = await supabase
          .from('forum_posts')
          .select('*', { count: 'exact' })
          .gte('created_at', today.toISOString())

        return NextResponse.json({
          total_threads: data.total_threads || 0,
          total_posts: data.total_posts || 0,
          total_members: data.total_members || 0,
          newest_member: newestMember || null,
          active_user_count: activeUserCount || 0,
          todays_posts: todaysPosts || 0
        })
      }

      case 'categories': {
        // Get forum categories
        const { data, error } = await supabase
          .from('forum_categories')
          .select('*')
          .order('sort_order', { ascending: true })

        if (error) {
          throw new Error(`Error fetching categories: ${error.message}`)
        }

        return NextResponse.json(data)
      }

      case 'threads': {
        const categoryId = searchParams.get('categoryId')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const offset = (page - 1) * limit

        // Build the query
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

        // Execute the query with pagination
        const { data: threads, error, count } = await query
          .order('is_pinned', { ascending: false })
          .order('updated_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (error) {
          throw new Error(`Error fetching threads: ${error.message}`)
        }

        // Get reply counts for each thread individually
        const postCounts: Array<{ thread_id: string, count: string }> = [];
        for (const thread of threads) {
          const { count } = await supabase
            .from('forum_posts')
            .select('*', { count: 'exact' })
            .eq('thread_id', thread.id);

          if (count !== null) {
            postCounts.push({ thread_id: thread.id, count: count.toString() });
          }
        }

        if (postCounts.length > 0) {
          // Create a map of thread ID to reply count
          const replyCountMap = new Map<string, number>()
          postCounts.forEach((item: { thread_id: string, count: string }) => {
            // Subtract 1 to get reply count (excluding original post)
            const count = parseInt(item.count) - 1
            replyCountMap.set(item.thread_id, count > 0 ? count : 0)
          })

          // Add reply counts to threads
          threads.forEach(thread => {
            thread.reply_count = replyCountMap.get(thread.id) || 0
          })
        }

        return NextResponse.json({
          threads: threads || [],
          total: count || 0,
          page,
          limit
        })
      }

      case 'thread': {
        const id = searchParams.get('id')

        if (!id) {
          return NextResponse.json(
            { error: 'Thread ID is required' },
            { status: 400 }
          )
        }

        // Get the thread with its category and author
        const { data: thread, error: threadError } = await supabase
          .from('forum_threads')
          .select(`
            *,
            category:forum_categories(*),
            author:profiles(id, username, avatar_url, role, created_at, post_count)
          `)
          .eq('id', id)
          .single()

        if (threadError) {
          throw new Error(`Error fetching thread: ${threadError.message}`)
        }

        // Increment view count
        await supabase.rpc('increment_thread_view', { thread_id: id })

        // Get the posts for this thread
        const { data: posts, error: postsError } = await supabase
          .from('forum_posts')
          .select(`
            *,
            author:profiles(id, username, avatar_url, role, created_at, post_count)
          `)
          .eq('thread_id', id)
          .order('created_at', { ascending: true })

        if (postsError) {
          throw new Error(`Error fetching posts: ${postsError.message}`)
        }

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

        // Get like counts for each post individually
        if (posts && posts.length > 0) {
          for (const post of posts) {
            const { count } = await supabase
              .from('forum_post_likes')
              .select('*', { count: 'exact' })
              .eq('post_id', post.id);

            post.likes = count || 0;
          }
        }

        return NextResponse.json({
          thread,
          posts: posts || []
        })
      }

      case 'recent': {
        const limit = parseInt(searchParams.get('limit') || '5')

        // Get recent threads
        const { data, error } = await supabase
          .from('forum_threads')
          .select(`
            *,
            category:forum_categories(id, name),
            author:profiles(id, username, avatar_url, role)
          `)
          .order('updated_at', { ascending: false })
          .limit(limit)

        if (error) {
          throw new Error(`Error fetching recent threads: ${error.message}`)
        }

        // Get reply counts for each thread individually
        const postCounts: Array<{ thread_id: string, count: string }> = [];
        for (const thread of data) {
          const { count } = await supabase
            .from('forum_posts')
            .select('*', { count: 'exact' })
            .eq('thread_id', thread.id);

          if (count !== null) {
            postCounts.push({ thread_id: thread.id, count: count.toString() });
          }
        }

        if (postCounts.length > 0) {
          // Create a map of thread ID to reply count
          const replyCountMap = new Map<string, number>()
          postCounts.forEach((item: { thread_id: string, count: string }) => {
            const count = parseInt(item.count) - 1
            replyCountMap.set(item.thread_id, count > 0 ? count : 0)
          })

          // Add reply counts to threads
          data.forEach(thread => {
            thread.reply_count = replyCountMap.get(thread.id) || 0
          })
        }

        return NextResponse.json(data || [])
      }

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/forum
 * 
 * Create a new thread or post
 * 
 * Body: {
 *   action: 'create_thread' | 'create_post' | 'like_post' | 'report',
 *   [action-specific fields]
 * }
 */
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()

  // Get current user
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    return NextResponse.json(
      { error: 'You must be logged in to perform this action' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'create_thread': {
        const { title, content, categoryId, isPinned = false, isLocked = false } = data

        if (!title || !content || !categoryId) {
          return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
          )
        }

        // Use the stored procedure to create the thread with its first post
        const { data: threadId, error } = await supabase
          .rpc('create_thread_with_post', {
            p_title: title,
            p_content: content,
            p_category_id: categoryId,
            p_is_pinned: isPinned,
            p_is_locked: isLocked
          })

        if (error) {
          throw new Error(`Error creating thread: ${error.message}`)
        }

        return NextResponse.json({ threadId })
      }

      case 'create_post': {
        const { threadId, content } = data

        if (!threadId || !content) {
          return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
          )
        }

        // Check if thread is locked
        const { data: thread, error: threadError } = await supabase
          .from('forum_threads')
          .select('is_locked')
          .eq('id', threadId)
          .single()

        if (threadError) {
          throw new Error(`Error checking thread: ${threadError.message}`)
        }

        if (thread.is_locked) {
          return NextResponse.json(
            { error: 'This thread is locked and cannot receive new replies' },
            { status: 403 }
          )
        }

        // Create the post
        const { data: post, error } = await supabase
          .from('forum_posts')
          .insert({
            thread_id: threadId,
            author_id: session.user.id,
            content,
            is_original_post: false
          })
          .select('*')
          .single()

        if (error) {
          throw new Error(`Error creating post: ${error.message}`)
        }

        // Update the thread's updated_at timestamp
        await supabase
          .from('forum_threads')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', threadId)

        // Increment the user's post count
        await supabase
          .rpc('increment_user_post_count', { user_id: session.user.id })

        return NextResponse.json(post)
      }

      case 'like_post': {
        const { postId } = data

        if (!postId) {
          return NextResponse.json(
            { error: 'Post ID is required' },
            { status: 400 }
          )
        }

        // Check if user has already liked the post
        const { data: existingLike, error: checkError } = await supabase
          .from('forum_post_likes')
          .select('*')
          .eq('post_id', postId)
          .eq('user_id', session.user.id)
          .maybeSingle()

        if (checkError) {
          throw new Error(`Error checking like: ${checkError.message}`)
        }

        if (existingLike) {
          // User already liked this post, so remove the like
          const { error: unlikeError } = await supabase
            .from('forum_post_likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', session.user.id)

          if (unlikeError) {
            throw new Error(`Error removing like: ${unlikeError.message}`)
          }

          return NextResponse.json({ liked: false })
        } else {
          // User hasn't liked this post yet, so add a like
          const { error: likeError } = await supabase
            .from('forum_post_likes')
            .insert({
              post_id: postId,
              user_id: session.user.id
            })

          if (likeError) {
            throw new Error(`Error adding like: ${likeError.message}`)
          }

          return NextResponse.json({ liked: true })
        }
      }

      case 'report': {
        const { contentType, contentId, reason, details } = data

        if (!contentType || !contentId || !reason) {
          return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
          )
        }

        // Create report
        const { data: report, error } = await supabase
          .from('forum_reports')
          .insert({
            reporter_id: session.user.id,
            content_type: contentType,
            content_id: contentId,
            reason,
            details: details || null,
            status: 'pending'
          })
          .select('id')
          .single()

        if (error) {
          throw new Error(`Error creating report: ${error.message}`)
        }

        return NextResponse.json({ reportId: report.id })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    )
  }
}