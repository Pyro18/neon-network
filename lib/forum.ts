import { createClient } from '@/lib/supabase'
import { PostgrestError, SupabaseClient } from '@supabase/supabase-js'

/**
 * Tipi TypeScript che rappresentano lo schema del database per il sistema forum
 */

// Rappresenta una categoria del forum
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

// Rappresenta un thread (argomento) del forum
export type ForumThread = {
  id: string
  title: string
  category_id: string
  author_id: string
  is_pinned: boolean
  is_locked: boolean
  is_announcement: boolean
  views: number
  reply_count: number
  last_reply_at: string | null
  last_reply_by: string | null
  created_at: string
  updated_at: string
  category?: ForumCategory
  author?: ForumUser
}

// Rappresenta un post (messaggio) all'interno di un thread
export type ForumPost = {
  id: string
  thread_id: string
  author_id: string
  content: string
  is_original_post: boolean
  is_edited: boolean
  edited_at: string | null
  edited_by: string | null
  like_count: number
  created_at: string
  updated_at: string
  author?: ForumUser
  liked_by_current_user?: boolean
}

// Rappresenta un utente del forum con statistiche
export type ForumUser = {
  id: string
  username: string
  avatar_url: string
  role: string
  joined_at: string
  post_count: number
}

// Statistiche generali del forum
export type ForumStats = {
  total_threads: number
  total_posts: number
  total_members: number
  newest_member?: ForumUser
  active_user_count: number
  todays_posts: number
}

/**
 * Helper per la gestione degli errori nelle operazioni del forum
 */
type Result<T> = {
  data: T | null
  error: Error | PostgrestError | null
}

/**
 * Funzioni API per le operazioni del forum
 */

/**
 * Recupera tutte le categorie del forum ordinate per priorità
 * @returns Promise con array di categorie o errore
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
    console.error('Errore nel recupero delle categorie del forum:', error)
    return { data: null, error: error as Error | PostgrestError }
  }
}

/**
 * Recupera i thread del forum con paginazione e filtri
 * @param options - Opzioni di filtro e paginazione
 * @returns Promise con thread e conteggio totale o errore
 */
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
        author:profiles!forum_threads_author_id_fkey(id, username, avatar_url, role, joined_at, post_count)
      `, { count: 'exact' })

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    // Ottiene i thread con paginazione, ordinati per thread fissati e data di aggiornamento
    const { data: threads, error, count } = await query
      .order('is_pinned', { ascending: false })
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return {
      data: {
        threads: threads || [],
        total: count || 0
      },
      error: null
    }
  } catch (error) {
    console.error('Errore nel recupero dei thread del forum:', error)
    return { data: null, error: error as Error | PostgrestError }
  }
}

/**
 * Recupera i thread più recenti del forum
 * @param limit - Numero massimo di thread da recuperare
 * @returns Promise con array di thread recenti o errore
 */
export async function getRecentThreads(limit = 5): Promise<Result<ForumThread[]>> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('forum_threads')
      .select(`
        *,
        category:forum_categories(id, name, color),
        author:profiles!forum_threads_author_id_fkey(id, username, avatar_url, role)
      `)
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Errore nel recupero dei thread recenti:', error)
    return { data: null, error: error as Error | PostgrestError }
  }
}

/**
 * Recupera un singolo thread con tutti i suoi post
 * @param threadId - ID del thread da recuperare
 * @returns Promise con thread e post o errore
 */
export async function getThreadById(threadId: string): Promise<Result<{ thread: ForumThread, posts: ForumPost[] }>> {
  const supabase = createClient()

  try {
    // Recupera il thread con categoria e autore
    const { data: thread, error: threadError } = await supabase
      .from('forum_threads')
      .select(`
        *,
        category:forum_categories(*),
        author:profiles!forum_threads_author_id_fkey(id, username, avatar_url, role, joined_at, post_count)
      `)
      .eq('id', threadId)
      .single()

    if (threadError) throw threadError

    try {
      await supabase.rpc('increment_thread_views', { thread_id: threadId })
    } catch (viewError) {
      console.warn('Impossibile incrementare il contatore di visualizzazioni:', viewError)
    }

    const { data: posts, error: postsError } = await supabase
      .from('forum_posts')
      .select(`
        *,
        author:profiles!forum_posts_author_id_fkey(id, username, avatar_url, role, joined_at, post_count)
      `)
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })

    if (postsError) throw postsError

    const { data: { session } } = await supabase.auth.getSession()
    const currentUserId = session?.user?.id

    if (currentUserId && posts) {
      const { data: likes } = await supabase
        .from('forum_post_likes')
        .select('post_id')
        .eq('user_id', currentUserId)

      const likedPostIds = likes?.map(like => like.post_id) || []

      posts.forEach(post => {
        post.liked_by_current_user = likedPostIds.includes(post.id)
      })
    }

    return {
      data: {
        thread,
        posts: posts || []
      },
      error: null
    }
  } catch (error) {
    console.error('Errore nel recupero del thread per ID:', error)
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

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    return { data: null, error: new Error('Devi essere autenticato per creare un thread') }
  }

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
    console.error('Errore nella creazione del thread:', error)
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

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    return { data: null, error: new Error('Devi essere autenticato per creare un post') }
  }

  try {
    const { data: thread, error: threadError } = await supabase
      .from('forum_threads')
      .select('is_locked')
      .eq('id', data.threadId)
      .single()

    if (threadError) throw threadError

    if (thread.is_locked) {
      return { data: null, error: new Error('Questo thread è bloccato e non può ricevere nuove risposte') }
    }

    // Crea il post come risposta al thread
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

    try {
      await supabase.rpc('increment_thread_reply_count', {
        thread_id: data.threadId,
        user_id: session.user.id
      })
    } catch (rpcError) {
      console.warn('Impossibile aggiornare il contatore di risposte del thread tramite RPC, fallback al aggiornamento manuale:', rpcError)

      const { data: currentThread } = await supabase
        .from('forum_threads')
        .select('reply_count')
        .eq('id', data.threadId)
        .single()

      const newReplyCount = (currentThread?.reply_count || 0) + 1

      await supabase
        .from('forum_threads')
        .update({
          reply_count: newReplyCount,
          last_reply_at: new Date().toISOString(),
          last_reply_by: session.user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.threadId)
    }

    try {
      await supabase.rpc('increment_user_post_count', { user_id: session.user.id })
    } catch (postCountError) {
      console.warn('Impossibile incrementare il contatore di post:', postCountError)
    }

    return { data: post, error: null }
  } catch (error) {
    console.error('Errore nella creazione del post:', error)
    return { data: null, error: error as Error | PostgrestError }
  }
}

export async function togglePostLike(postId: string): Promise<Result<{ liked: boolean }>> {
  const supabase = createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    return { data: null, error: new Error('Devi essere autenticato per mettere like a un post') }
  }

  try {
    const { data: existingLike, error: checkError } = await supabase
      .from('forum_post_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', session.user.id)
      .maybeSingle()

    if (checkError) throw checkError

    if (existingLike) {
      const { error: unlikeError } = await supabase
        .from('forum_post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', session.user.id)

      if (unlikeError) throw unlikeError

      try {
        await supabase.rpc('decrement_post_like_count', { post_id: postId })
      } catch (rpcError) {
        console.warn('Impossibile decrementare il contatore di like tramite RPC, fallback al aggiornamento manuale:', rpcError)

        const { data: currentPost } = await supabase
          .from('forum_posts')
          .select('like_count')
          .eq('id', postId)
          .single()

        const newLikeCount = Math.max(0, (currentPost?.like_count || 0) - 1)

        await supabase
          .from('forum_posts')
          .update({ like_count: newLikeCount })
          .eq('id', postId)
      }

      return { data: { liked: false }, error: null }
    } else {
      const { error: likeError } = await supabase
        .from('forum_post_likes')
        .insert({
          post_id: postId,
          user_id: session.user.id
        })

      if (likeError) throw likeError

      try {
        await supabase.rpc('increment_post_like_count', { post_id: postId })
      } catch (rpcError) {
        console.warn('Impossibile incrementare il contatore di like tramite RPC, fallback al aggiornamento manuale:', rpcError)

        const { data: currentPost } = await supabase
          .from('forum_posts')
          .select('like_count')
          .eq('id', postId)
          .single()

        const newLikeCount = (currentPost?.like_count || 0) + 1

        await supabase
          .from('forum_posts')
          .update({ like_count: newLikeCount })
          .eq('id', postId)
      }

      return { data: { liked: true }, error: null }
    }
  } catch (error) {
    console.error('Errore nel toggle del like del post:', error)
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

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    return { data: null, error: new Error('Devi essere autenticato per segnalare contenuti') }
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
    console.error('Errore nella segnalazione del contenuto:', error)
    return { data: null, error: error as Error | PostgrestError }
  }
}

export async function getForumStats(): Promise<Result<ForumStats>> {
  const supabase = createClient()

  try {
    const [threadsResult, postsResult, membersResult] = await Promise.all([
      supabase.from('forum_threads').select('*', { count: 'exact', head: true }),
      supabase.from('forum_posts').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true })
    ])

    const { data: newestMember, error: memberError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, role, joined_at, post_count')
      .order('joined_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (memberError && memberError.code !== 'PGRST116') {
      console.warn('Errore nel recupero del membro più recente:', memberError)
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { count: todaysPosts, error: todaysError } = await supabase
      .from('forum_posts')
      .select('*', { count: 'exact' })
      .gte('created_at', today.toISOString())

    if (todaysError) {
      console.warn('Errore nel recupero dei post di oggi:', todaysError)
    }

    return {
      data: {
        total_threads: threadsResult.count || 0,
        total_posts: postsResult.count || 0,
        total_members: membersResult.count || 0,
        newest_member: newestMember ? {
          id: newestMember.id,
          username: newestMember.username,
          avatar_url: newestMember.avatar_url,
          role: newestMember.role,
          joined_at: newestMember.joined_at,
          post_count: newestMember.post_count || 0
        } : undefined,
        active_user_count: 0,
        todays_posts: todaysPosts || 0
      },
      error: null
    }
  } catch (error) {
    console.error('Errore nel recupero delle statistiche del forum:', error)
    return { data: null, error: error as Error | PostgrestError }
  }
}