"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MessageSquare, ArrowUpRight } from "lucide-react"
import { NeonParticles } from "@/components/neon-particles"
import { NeonButton } from "@/components/neon-button"
import { ForumCategoryCard } from "@/components/forum/forum-category-card"
import { ForumThreadItem } from "@/components/forum/forum-thread-item"
import { ForumStats } from "@/components/forum/forum-stats"
import { 
  useForumCategories, 
  useRecentThreads, 
  useForumStats 
} from "@/hooks/use-forum"
import { Skeleton } from "@/components/ui/skeleton"

export default function ForumPage() {
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useForumCategories()
  const { threads: recentThreads, isLoading: recentLoading, error: recentError } = useRecentThreads(5)
  const { stats, isLoading: statsLoading, error: statsError } = useForumStats()
  
  const [pageLoading, setPageLoading] = useState(true)
  
  useEffect(() => {
    if (!categoriesLoading && !recentLoading && !statsLoading) {
      setPageLoading(false)
    }
  }, [categoriesLoading, recentLoading, statsLoading])

  return (
    <div className="relative min-h-screen">
      <NeonParticles density={30} />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Community Forum</h1>
            <p className="text-muted-foreground">
              Join discussions, share your experiences, and connect with other players
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/forum/search">
              <NeonButton variant="blue">
                Search Forum
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </NeonButton>
            </Link>
            <Link href="/forum/new-thread">
              <NeonButton>
                New Thread
                <MessageSquare className="ml-2 h-4 w-4" />
              </NeonButton>
            </Link>
          </div>
        </div>

        <ForumStats />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Categories</h2>
              <div className="grid gap-4">
                {categoriesLoading ? (
                  // Show skeletons while loading
                  Array(5).fill(0).map((_, index) => (
                    <div key={index} className="p-4 rounded-lg border border-border/30 animate-pulse">
                      <div className="flex items-start gap-4">
                        <Skeleton className="h-10 w-10 rounded-md" />
                        <div className="flex-1">
                          <Skeleton className="h-6 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-full mb-4" />
                          <div className="flex gap-4">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : categoriesError ? (
                  // Show error message if there's an error
                  <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10">
                    <p className="text-destructive">Error loading categories: {categoriesError.message}</p>
                  </div>
                ) : (
                  // Show categories when loaded
                  categories?.map((category) => (
                    <ForumCategoryCard 
                      key={category.id} 
                      category={{
                        id: category.id,
                        name: category.name,
                        description: category.description,
                        icon: category.icon || "MessageSquare", // Fallback icon
                        threads: 0, // These properties aren't in ForumCategory type
                        posts: 0,   // but are required by ForumCategoryCard
                        color: category.color || "default",
                      }} 
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Recent Activity</h2>
                <Link href="/forum/recent" className="text-primary hover:text-primary/80 text-sm">
                  View all
                </Link>
              </div>

              <div className="space-y-3">
                {recentLoading ? (
                  // Show skeletons while loading
                  Array(5).fill(0).map((_, index) => (
                    <div key={index} className="p-3 rounded-md border border-border/30 animate-pulse">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-4/5 mb-2" />
                          <Skeleton className="h-3 w-2/3" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : recentError ? (
                  // Show error message if there's an error
                  <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10">
                    <p className="text-destructive">Error loading recent activity: {recentError.message}</p>
                  </div>
                ) : (
                  // Show recent threads when loaded
                  recentThreads?.map((thread) => (
                    <ForumThreadItem 
                      key={thread.id} 
                      thread={{
                        ...thread,
                        category_id: thread.category?.id || '',
                        author_id: thread.author?.id || '',
                        updated_at: thread.updated_at || thread.created_at
                      }} 
                      compact 
                    />
                  ))
                )}
              </div>
            </div>

            <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-border/30 p-4">
              <h3 className="text-lg font-semibold mb-3">Forum Statistics</h3>
              <div className="space-y-2">
                {statsLoading ? (
                  // Show skeletons while loading
                  Array(4).fill(0).map((_, index) => (
                    <div key={index} className="flex justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))
                ) : statsError ? (
                  // Show error message if there's an error
                  <p className="text-destructive">Error loading stats: {statsError.message}</p>
                ) : (
                  // Show stats when loaded
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Threads:</span>
                      <span className="font-medium">{stats?.total_threads || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Posts:</span>
                      <span className="font-medium">{stats?.total_posts || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Members:</span>
                      <span className="font-medium">{stats?.total_members || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Newest Member:</span>
                      <span className="font-medium text-primary">
                        {stats?.newest_member?.username || "Unknown"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}