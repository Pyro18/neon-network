import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/admin/categories - Get all categories
 * POST /api/admin/categories - Create new category
 * PUT /api/admin/categories/[id] - Update category
 * DELETE /api/admin/categories/[id] - Delete category
 */

// Helper function to check admin permissions
async function checkAdminPermissions(supabase: any) {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
        return { error: 'Authentication required', status: 401 }
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, is_banned')
        .eq('id', session.user.id)
        .single()

    if (profileError) {
        return { error: 'Failed to verify permissions', status: 500 }
    }

    if (profile.is_banned) {
        return { error: 'Account is banned', status: 403 }
    }

    if (profile.role !== 'admin') {
        return { error: 'Admin privileges required', status: 403 }
    }

    return { userId: session.user.id }
}

/**
 * GET - Get all categories (with thread counts)
 */
export async function GET(request: NextRequest) {
    const supabase = await createServerSupabaseClient()

    try {
        // Check admin permissions
        const authCheck = await checkAdminPermissions(supabase)
        if ('error' in authCheck) {
            return NextResponse.json(
                { error: authCheck.error },
                { status: authCheck.status }
            )
        }

        // Get categories with thread counts
        const { data: categories, error } = await supabase
            .from('forum_categories')
            .select(`
        *,
        thread_count:forum_threads(count),
        post_count:forum_posts!inner(
          forum_threads!inner(category_id)
        )
      `)
            .order('sort_order', { ascending: true })

        if (error) {
            throw new Error(`Error fetching categories: ${error.message}`)
        }

        // Transform data to include counts
        const categoriesWithCounts = categories?.map(category => ({
            ...category,
            thread_count: Array.isArray(category.thread_count) ? category.thread_count.length : 0,
            post_count: Array.isArray(category.post_count) ? category.post_count.length : 0
        }))

        return NextResponse.json(categoriesWithCounts || [])
    } catch (error) {
        console.error('Categories API error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error occurred' },
            { status: 500 }
        )
    }
}

/**
 * POST - Create new category
 */
export async function POST(request: NextRequest) {
    const supabase = await createServerSupabaseClient()

    try {
        // Check admin permissions
        const authCheck = await checkAdminPermissions(supabase)
        if ('error' in authCheck) {
            return NextResponse.json(
                { error: authCheck.error },
                { status: authCheck.status }
            )
        }

        const body = await request.json()
        const { name, description, icon, color, sort_order } = body

        // Validate required fields
        if (!name || !description) {
            return NextResponse.json(
                { error: 'Name and description are required' },
                { status: 400 }
            )
        }

        // Check if category name already exists
        const { data: existingCategory } = await supabase
            .from('forum_categories')
            .select('id')
            .eq('name', name)
            .single()

        if (existingCategory) {
            return NextResponse.json(
                { error: 'A category with this name already exists' },
                { status: 400 }
            )
        }

        // If no sort_order provided, set it to the highest + 1
        let finalSortOrder = sort_order
        if (finalSortOrder === undefined || finalSortOrder === null) {
            const { data: maxOrder } = await supabase
                .from('forum_categories')
                .select('sort_order')
                .order('sort_order', { ascending: false })
                .limit(1)
                .single()

            finalSortOrder = (maxOrder?.sort_order || 0) + 1
        }

        // Create the category
        const { data: newCategory, error } = await supabase
            .from('forum_categories')
            .insert({
                name,
                description,
                icon: icon || 'MessageSquare',
                color: color || 'default',
                sort_order: finalSortOrder,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select('*')
            .single()

        if (error) {
            throw new Error(`Error creating category: ${error.message}`)
        }

        return NextResponse.json(newCategory)
    } catch (error) {
        console.error('Create category error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create category' },
            { status: 500 }
        )
    }
}

/**
 * PUT - Update category
 */
export async function PUT(request: NextRequest) {
    const supabase = await createServerSupabaseClient()

    try {
        // Check admin permissions
        const authCheck = await checkAdminPermissions(supabase)
        if ('error' in authCheck) {
            return NextResponse.json(
                { error: authCheck.error },
                { status: authCheck.status }
            )
        }

        const body = await request.json()
        const { id, name, description, icon, color, sort_order } = body

        if (!id) {
            return NextResponse.json(
                { error: 'Category ID is required' },
                { status: 400 }
            )
        }

        // Check if category exists
        const { data: existingCategory, error: fetchError } = await supabase
            .from('forum_categories')
            .select('*')
            .eq('id', id)
            .single()

        if (fetchError || !existingCategory) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            )
        }

        // Check if new name conflicts with existing categories (excluding current)
        if (name && name !== existingCategory.name) {
            const { data: nameConflict } = await supabase
                .from('forum_categories')
                .select('id')
                .eq('name', name)
                .neq('id', id)
                .single()

            if (nameConflict) {
                return NextResponse.json(
                    { error: 'A category with this name already exists' },
                    { status: 400 }
                )
            }
        }

        // Update the category
        const updateData: any = {
            updated_at: new Date().toISOString()
        }

        if (name !== undefined) updateData.name = name
        if (description !== undefined) updateData.description = description
        if (icon !== undefined) updateData.icon = icon
        if (color !== undefined) updateData.color = color
        if (sort_order !== undefined) updateData.sort_order = sort_order

        const { data: updatedCategory, error: updateError } = await supabase
            .from('forum_categories')
            .update(updateData)
            .eq('id', id)
            .select('*')
            .single()

        if (updateError) {
            throw new Error(`Error updating category: ${updateError.message}`)
        }

        return NextResponse.json(updatedCategory)
    } catch (error) {
        console.error('Update category error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to update category' },
            { status: 500 }
        )
    }
}

/**
 * DELETE - Delete category
 */
export async function DELETE(request: NextRequest) {
    const supabase = await createServerSupabaseClient()

    try {
        // Check admin permissions
        const authCheck = await checkAdminPermissions(supabase)
        if ('error' in authCheck) {
            return NextResponse.json(
                { error: authCheck.error },
                { status: authCheck.status }
            )
        }

        const { searchParams } = request.nextUrl
        const categoryId = searchParams.get('id')

        if (!categoryId) {
            return NextResponse.json(
                { error: 'Category ID is required' },
                { status: 400 }
            )
        }

        // Check if category exists
        const { data: existingCategory } = await supabase
            .from('forum_categories')
            .select('id, name')
            .eq('id', categoryId)
            .single()

        if (!existingCategory) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            )
        }

        // Check if category has threads
        const { count: threadCount } = await supabase
            .from('forum_threads')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', categoryId)

        if (threadCount && threadCount > 0) {
            return NextResponse.json(
                {
                    error: `Cannot delete category with ${threadCount} threads. Move or delete threads first.`,
                    threadCount
                },
                { status: 400 }
            )
        }

        // Delete the category
        const { error: deleteError } = await supabase
            .from('forum_categories')
            .delete()
            .eq('id', categoryId)

        if (deleteError) {
            throw new Error(`Error deleting category: ${deleteError.message}`)
        }

        return NextResponse.json({
            success: true,
            message: `Category "${existingCategory.name}" deleted successfully`
        })
    } catch (error) {
        console.error('Delete category error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to delete category' },
            { status: 500 }
        )
    }
}