import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * API Route per le operazioni del forum
 * 
 * GET: Recupera dati (statistiche, categorie, thread, post)
 * POST: Crea nuovi contenuti (thread, post, categorie)
 * 
 * Supporta query parameters per filtrare e paginare i risultati
 */

/**
 * Gestisce le richieste GET per i dati del forum
 * @param request - Richiesta HTTP con parametri di query
 * @returns Response JSON con i dati richiesti
 */
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get('type')

  try {
    switch (type) {
      case 'stats': {
        const stats = await supabase.rpc('get_forum_stats')

        if (stats.error) {
          throw new Error(`Errore nel recupero statistiche forum: ${stats.error.message}`)
        }

        // Ottieni il membro più recente
        const { data: newestMember } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, role, joined_at')
          .order('joined_at', { ascending: false })
          .limit(1)
          .single()

        return NextResponse.json({
          ...stats.data,
          newest_member: newestMember
        })
      }

      case 'categories': {
        const { data, error } = await supabase
          .from('forum_categories')
          .select(`
            *,
            thread_count:forum_threads(count),
            post_count:forum_posts(count)
          `)
          .order('sort_order', { ascending: true })

        if (error) {
          throw new Error(`Errore nel recupero categorie: ${error.message}`)
        }

        // Trasforma i dati per includere i conteggi
        const categoriesWithCounts = data?.map(category => ({
          ...category,
          thread_count: category.thread_count?.[0]?.count || 0,
          post_count: category.post_count?.[0]?.count || 0
        }))

        return NextResponse.json(categoriesWithCounts)
      }

      case 'threads': {
        const categoryId = searchParams.get('categoryId')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const offset = (page - 1) * limit

        let query = supabase
          .from('forum_threads')
          .select(`
            *,
            category:forum_categories(*),
            author:profiles(id, username, avatar_url, role),
            last_reply_user:profiles!forum_threads_last_reply_by_fkey(username, avatar_url)
          `, { count: 'exact' })

        if (categoryId) {
          query = query.eq('category_id', categoryId)
        }

        const { data: threads, error, count } = await query
          .order('is_pinned', { ascending: false })
          .order('last_reply_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (error) {
          throw new Error(`Errore nel recupero thread: ${error.message}`)
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
            { error: 'ID Thread richiesto' },
            { status: 400 }
          )
        }        // Ottieni il thread
        const { data: thread, error: threadError } = await supabase
          .from('forum_threads')
          .select(`
            *,
            category:forum_categories(*),
            author:profiles(id, username, avatar_url, role, joined_at, post_count)
          `)
          .eq('id', id)
          .single()

        if (threadError) {
          throw new Error(`Errore nel recupero thread: ${threadError.message}`)
        }

        // Incrementa contatore visualizzazioni
        await supabase.rpc('increment_thread_view', { thread_uuid: id })

        // Ottieni i post per questo thread
        const { data: posts, error: postsError } = await supabase
          .from('forum_posts')
          .select(`
            *,
            author:profiles(id, username, avatar_url, role, joined_at, post_count),
            likes:forum_post_likes(count)
          `)
          .eq('thread_id', id)
          .order('created_at', { ascending: true })

        if (postsError) {
          throw new Error(`Errore nel recupero post: ${postsError.message}`)
        }

        // Verifica se l'utente corrente ha messo like a qualche post
        const { data: { session } } = await supabase.auth.getSession()
        const currentUserId = session?.user?.id

        if (currentUserId && posts) {
          const { data: userLikes } = await supabase
            .from('forum_post_likes')
            .select('post_id')
            .eq('user_id', currentUserId)

          const likedPostIds = userLikes?.map(like => like.post_id) || []

          posts.forEach(post => {
            post.liked_by_current_user = likedPostIds.includes(post.id)
            post.like_count = post.likes?.[0]?.count || 0
          })
        }

        return NextResponse.json({
          thread,
          posts: posts || []
        })
      }

      case 'recent': {
        const limit = parseInt(searchParams.get('limit') || '5')

        const { data, error } = await supabase
          .from('forum_threads')
          .select(`
            *,
            category:forum_categories(id, name, color),
            author:profiles(id, username, avatar_url, role)
          `)
          .order('updated_at', { ascending: false })
          .limit(limit)

        if (error) {
          throw new Error(`Errore nel recupero thread recenti: ${error.message}`)
        }

        return NextResponse.json(data || [])
      }

      default:
        return NextResponse.json(
          { error: 'Parametro type non valido' },
          { status: 400 })
    }
  } catch (error) {
    console.error('Errore API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Si è verificato un errore sconosciuto' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/forum
 */
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  // Ottieni l'utente corrente
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Devi essere autenticato per eseguire questa azione' },
      { status: 401 }
    )
  }

  // Verifica se l'utente è bannato
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_banned, ban_reason')
    .eq('id', session.user.id)
    .single()

  if (profile?.is_banned) {
    return NextResponse.json(
      { error: `Il tuo account è bannato: ${profile.ban_reason || 'Nessuna motivazione fornita'}` },
      { status: 403 }
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
            { error: 'Campi obbligatori mancanti' },
            { status: 400 }
          )
        }

        // Verifica se l'utente può fissare/bloccare (solo moderatori e admin)
        if (isPinned || isLocked) {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()

          if (!userProfile || !['moderator', 'admin'].includes(userProfile.role)) {
            return NextResponse.json(
              { error: 'Non hai i permessi per fissare o bloccare thread' },
              { status: 403 }
            )
          }
        }

        const { data: threadId, error } = await supabase
          .rpc('create_thread_with_post', {
            p_title: title,
            p_content: content,
            p_category_id: categoryId,
            p_is_pinned: isPinned,
            p_is_locked: isLocked
          })

        if (error) {
          throw new Error(`Errore nella creazione thread: ${error.message}`)
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
          // Check if user is moderator or admin
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()

          if (!userProfile || !['moderator', 'admin'].includes(userProfile.role)) {
            return NextResponse.json(
              { error: 'This thread is locked and cannot receive new replies' },
              { status: 403 }
            )
          }
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
          .select(`
            *,
            author:profiles(id, username, avatar_url, role, joined_at, post_count)
          `)
          .single()

        if (error) {
          throw new Error(`Error creating post: ${error.message}`)
        }

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

        // Check if user already liked the post
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
          // Remove like
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
          // Add like
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

      case 'report_content': {
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

      case 'moderate_content': {
        const { contentType, contentId, action: moderateAction, reason } = data

        // Check if user is moderator or admin
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (!userProfile || !['moderator', 'admin'].includes(userProfile.role)) {
          return NextResponse.json(
            { error: 'You do not have permission to moderate content' },
            { status: 403 }
          )
        }

        if (contentType === 'thread') {
          const { error } = await supabase
            .from('forum_threads')
            .update({
              is_locked: moderateAction === 'lock',
              is_pinned: moderateAction === 'pin',
              updated_at: new Date().toISOString()
            })
            .eq('id', contentId)

          if (error) {
            throw new Error(`Error moderating thread: ${error.message}`)
          }
        }

        return NextResponse.json({ success: true })
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