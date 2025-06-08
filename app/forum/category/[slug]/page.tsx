"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ChevronRight, MessageSquare, Plus } from "lucide-react"
import { NeonParticles } from "@/components/neon-particles"
import { NeonButton } from "@/components/neon-button"
import { ForumThreadItem } from "@/components/forum/forum-thread-item"
import { ForumPagination } from "@/components/forum/forum-pagination"
import { useForumThreads, useForumCategories } from "@/hooks/use-forum"
import { useAuth } from "@/hooks/use-auth"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CategoryPage() {
  const params = useParams()
  const categorySlug = params.slug as string
  const [currentPage, setCurrentPage] = useState(1)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [categoryName, setCategoryName] = useState<string>("")
  const [categoryDescription, setCategoryDescription] = useState<string>("")
  const [categoryColor, setCategoryColor] = useState<string>("default")

  const { categories, isLoading: categoriesLoading } = useForumCategories()
  const {
    threads,
    totalThreads,
    totalPages,
    isLoading: threadsLoading,
    error: threadsError
  } = useForumThreads({
    categoryId: categoryId || undefined,
    page: currentPage,
    limit: 15
  })

  const { user, profile } = useAuth()

  // Find category by slug
  useEffect(() => {
    if (categories && categorySlug) {
      const category = categories.find(cat =>
          cat.name.toLowerCase().replace(/\s+/g, '-') === categorySlug ||
          cat.id === categorySlug
      )

      if (category) {
        setCategoryId(category.id)
        setCategoryName(category.name)
        setCategoryDescription(category.description)
        setCategoryColor(category.color)
      }
    }
  }, [categories, categorySlug])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Loading state
  if (categoriesLoading) {
    return (
        <div className="relative min-h-screen">
          <NeonParticles density={30} />
          <div className="container mx-auto px-4 py-12 relative z-10">
            <div className="space-y-6">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
    )
  }

  // Category not found
  if (!categoriesLoading && !categoryId) {
    return (
        <div className="relative min-h-screen">
          <NeonParticles density={30} />
          <div className="container mx-auto px-4 py-12 relative z-10">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link href="/forum" className="hover:text-primary">
                Forum
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span>Category Not Found</span>
            </div>

            <Alert className="max-w-md">
              <AlertDescription>
                The category you're looking for doesn't exist or has been removed.
              </AlertDescription>
            </Alert>

            <div className="mt-6">
              <Link href="/forum">
                <NeonButton variant="blue">
                  Back to Forum
                </NeonButton>
              </Link>
            </div>
          </div>
        </div>
    )
  }

  return (
      <div className="relative min-h-screen">
        <NeonParticles density={30} />

        <div className="container mx-auto px-4 py-12 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/forum" className="hover:text-primary">
              Forum
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{categoryName}</span>
          </div>

          {/* Category Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-3">
                <div className={`w-3 h-8 rounded-full bg-${categoryColor === 'default' ? 'primary' : categoryColor + '-500'}`} />
                {categoryName}
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                {categoryDescription}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
                <span>{totalThreads} threads</span>
                <span>•</span>
                <span>Page {currentPage} of {totalPages}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Link href="/forum">
                <NeonButton variant="blue">
                  All Categories
                </NeonButton>
              </Link>

              {user && profile && !profile.is_banned && (
                  <Link href={`/forum/new-thread?category=${categoryId}`}>
                    <NeonButton>
                      <Plus className="h-4 w-4 mr-2" />
                      New Thread
                    </NeonButton>
                  </Link>
              )}
            </div>
          </div>

          {/* Threads List */}
          <div className="space-y-4">
            {threadsLoading ? (
                // Loading skeletons
                Array(10).fill(0).map((_, index) => (
                    <div key={index} className="p-4 rounded-lg border border-border/30 animate-pulse">
                      <div className="flex items-start gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-6 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-full mb-2" />
                          <div className="flex gap-4">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                      </div>
                    </div>
                ))
            ) : threadsError ? (
                // Error state
                <Alert className="border-destructive/50 bg-destructive/10">
                  <AlertDescription>
                    Error loading threads: {threadsError.message}
                  </AlertDescription>
                </Alert>
            ) : threads && threads.length > 0 ? (
                // Threads list
                <>
                  {threads.map((thread) => (
                      <ForumThreadItem
                          key={thread.id}
                          thread={{
                            ...thread,
                            category_id: thread.category?.id || '',
                            author_id: thread.author?.id || '',
                            updated_at: thread.updated_at || thread.created_at
                          }}
                      />
                  ))}

                  {/* Pagination */}
                  {totalPages > 1 && (
                      <div className="flex justify-center mt-8">
                        <ForumPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            baseUrl={`/forum/category/${categorySlug}`}
                        />
                      </div>
                  )}
                </>
            ) : (
                // Empty state
                <div className="text-center py-12">
                  <div className="mb-6">
                    <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground/50" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No threads yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    This category doesn't have any threads yet. Be the first to start a discussion!
                  </p>

                  {user && profile && !profile.is_banned ? (
                      <Link href={`/forum/new-thread?category=${categoryId}`}>
                        <NeonButton>
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Thread
                        </NeonButton>
                      </Link>
                  ) : (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          {!user ? "Sign in to create threads" : "You need member status to create threads"}
                        </p>
                        {!user && (
                            <Link href="/auth/login">
                              <NeonButton variant="blue">Sign In</NeonButton>
                            </Link>
                        )}
                      </div>
                  )}
                </div>
            )}
          </div>
        </div>
      </div>
  )
}