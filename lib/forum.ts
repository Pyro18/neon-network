import { createClient } from '@/lib/supabase'

// Funzione helper per gestire gli errori delle query Supabase
const handleSupabaseError = (error: any, message: string) => {
  console.error(`${message}:`, error)
  throw new Error(message)
}

// CATEGORIE

/**
 * Ottiene tutte le categorie del forum
 */
export async function getCategories() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('position', { ascending: true })

  if (error) {
    handleSupabaseError(error, 'Errore nel caricamento delle categorie')
  }

  return data || []
}

/**
 * Ottiene una categoria specifica dal suo slug
 */
export async function getCategoryBySlug(slug: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    handleSupabaseError(error, `Categoria "${slug}" non trovata`)
  }

  return data
}

// THREAD

/**
 * Ottiene tutti i thread di una categoria specifica
 */
export async function getThreads(categoryId: string, page = 1, limit = 10) {
  const supabase = createClient()

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await supabase
    .from('threads')
    .select(`
      *,
      category:categories(id, name, slug),
      author:user_profiles(id, username, avatar_url, role),
      posts(count)
    `, { count: 'exact' })
    .eq('category_id', categoryId)
    .order('is_pinned', { ascending: false })
    .order('last_post_at', { ascending: false })
    .range(from, to)

  if (error) {
    handleSupabaseError(error, 'Errore nel caricamento dei thread')
  }

  return {
    threads: data || [],
    totalThreads: count || 0,
    totalPages: Math.ceil((count || 0) / limit)
  }
}

/**
 * Ottiene i thread più recenti
 */
export async function getRecentThreads(limit = 5) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('threads')
    .select(`
      *,
      category:categories(id, name, slug),
      author:user_profiles(id, username, avatar_url, role),
      posts(count)
    `)
    .order('last_post_at', { ascending: false })
    .limit(limit)

  if (error) {
    handleSupabaseError(error, 'Errore nel caricamento dei thread recenti')
  }

  return data || []
}

/**
 * Ottiene un thread specifico
 */
export async function getThread(threadId: string) {
  const supabase = createClient()

  // Prima otteniamo i dettagli del thread
  const { data: thread, error: threadError } = await supabase
    .from('threads')
    .select(`
      *,
      category:categories(id, name, slug),
      author:user_profiles(id, username, avatar_url, role)
    `)
    .eq('id', threadId)
    .single()

  if (threadError) {
    handleSupabaseError(threadError, 'Thread non trovato')
  }

  // Incrementiamo il contatore delle visualizzazioni
  try {
    await supabase
      .rpc('view_thread', { _thread_id: threadId })
  } catch (error) {
    console.error('Errore nell\'incremento del contatore visualizzazioni:', error)
  }

  return thread
}

/**
 * Crea un nuovo thread
 */
export async function createThread(title: string, categoryId: string, content: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('create_thread_with_post', {
      _title: title,
      _category_id: categoryId,
      _content: content
    })

  if (error) {
    handleSupabaseError(error, 'Errore nella creazione del thread')
  }

  return data
}

// POSTS

/**
 * Ottiene i post di un thread specifico
 */
export async function getPosts(threadId: string, page = 1, limit = 20) {
  const supabase = createClient()

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await supabase
    .from('posts')
    .select(`
      *,
      author:user_profiles(id, username, avatar_url, role, post_count, joined_at),
      likes(count)
    `, { count: 'exact' })
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })
    .range(from, to)

  if (error) {
    handleSupabaseError(error, 'Errore nel caricamento dei post')
  }

  return {
    posts: data || [],
    totalPosts: count || 0,
    totalPages: Math.ceil((count || 0) / limit)
  }
}

/**
 * Crea una risposta a un thread
 */
export async function createReply(threadId: string, content: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('create_reply', {
      _thread_id: threadId,
      _content: content
    })

  if (error) {
    handleSupabaseError(error, 'Errore nella creazione della risposta')
  }

  return data
}

// LIKES

/**
 * Mette o toglie un like a un post
 */
export async function toggleLike(postId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('toggle_like', { _post_id: postId })

  if (error) {
    handleSupabaseError(error, 'Errore nell\'aggiornamento del like')
  }

  return data
}

// SEGNALAZIONI

/**
 * Segnala un post
 */
export async function reportPost(postId: string, reason: string) {
  const supabase = createClient()

  const { error } = await supabase
    .rpc('report_post', {
      _post_id: postId,
      _reason: reason
    })

  if (error) {
    handleSupabaseError(error, 'Errore nella segnalazione del post')
  }

  return true
}

// STATISTICHE

/**
 * Ottiene le statistiche del forum
 */
export async function getForumStats() {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('get_forum_stats')

  if (error) {
    handleSupabaseError(error, 'Errore nel caricamento delle statistiche')
  }

  return data || {
    totalThreads: 0,
    totalPosts: 0,
    totalMembers: 0,
    newestMember: { username: 'Nessuno' },
    activeUsers: 0,
    todaysPosts: 0
  }
}

// MODERAZIONE

/**
 * Blocca o sblocca un thread
 */
export async function toggleThreadLock(threadId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('toggle_thread_lock', { _thread_id: threadId })

  if (error) {
    handleSupabaseError(error, 'Errore nel blocco/sblocco del thread')
  }

  return data
}

/**
 * Pinna o spinna un thread
 */
export async function toggleThreadPin(threadId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('toggle_thread_pin', { _thread_id: threadId })

  if (error) {
    handleSupabaseError(error, 'Errore nel pin/unpin del thread')
  }

  return data
}

/**
 * Ottiene tutte le segnalazioni in attesa
 */
export async function getPendingReports() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      post:posts(*),
      reporter:user_profiles!reports_reporter_id_fkey(username, avatar_url)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    handleSupabaseError(error, 'Errore nel caricamento delle segnalazioni')
  }

  return data || []
}

/**
 * Risolve una segnalazione
 */
export async function resolveReport(reportId: string, action: 'approve' | 'reject') {
  const supabase = createClient()

  const { error } = await supabase
    .from('reports')
    .update({
      status: action === 'approve' ? 'approved' : 'rejected',
      resolved_at: new Date().toISOString()
    })
    .eq('id', reportId)

  if (error) {
    handleSupabaseError(error, 'Errore nella risoluzione della segnalazione')
  }

  return true
}