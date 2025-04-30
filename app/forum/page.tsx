import Link from "next/link"
import { MessageSquare, ArrowUpRight } from "lucide-react"
import { NeonParticles } from "@/components/neon-particles"
import { NeonButton } from "@/components/neon-button"
import { ForumCategoryCard } from "@/components/forum/forum-category-card"
import { ForumThreadItem } from "@/components/forum/forum-thread-item"
import { ForumStats } from "@/components/forum/forum-stats"
import { useForumCategories, useForumThreads, useRecentThreads } from "@/hooks/use-forum"
import { ForumThread } from "@/lib/forum"

const { categories, isLoading } = useForumCategories()
const { threads, isLoading: threadsLoading } = useForumThreads()
const { threads: recentThreads, isLoading: recentLoading } = useRecentThreads()

export default function ForumPage() {
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
                {categories?.map((category) => (
                  <ForumCategoryCard 
                    key={category.id} 
                    category={{
                      ...category,
                      threads: 0,
                      posts: 0
                    }} 
                  />
                ))}
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
                {recentThreads?.map((thread: ForumThread) => (
                  <ForumThreadItem key={thread.id} thread={thread} compact />
                ))}
              </div>
            </div>

            <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-border/30 p-4">
              <h3 className="text-lg font-semibold mb-3">Forum Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Threads:</span>
                  <span className="font-medium">584</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Posts:</span>
                  <span className="font-medium">5,708</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Members:</span>
                  <span className="font-medium">1,245</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Newest Member:</span>
                  <span className="font-medium text-primary">CyberGamer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
