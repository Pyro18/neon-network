import Link from "next/link"
import { Plus, Settings, Users, MessageSquare, Flag, Trash2 } from "lucide-react"
import { NeonParticles } from "@/components/neon-particles"
import { NeonButton } from "@/components/neon-button"
import { AdminForumThreads } from "@/components/admin/admin-forum-threads"
import { AdminStats } from "@/components/admin/admin-stats"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminForumPage() {
  return (
    <div className="relative min-h-screen">
      <NeonParticles density={30} />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Forum Administration</h1>
            <p className="text-muted-foreground">Manage forum categories, threads, and user permissions</p>
          </div>

          <div className="flex gap-3">
            <Link href="/admin/forum/create">
              <NeonButton>
                New Thread
                <Plus className="ml-2 h-4 w-4" />
              </NeonButton>
            </Link>
            <Link href="/admin/forum/settings">
              <NeonButton variant="blue">
                Settings
                <Settings className="ml-2 h-4 w-4" />
              </NeonButton>
            </Link>
          </div>
        </div>

        <AdminStats />

        <div className="mt-12">
          <Tabs defaultValue="threads">
            <TabsList className="bg-background/20 backdrop-blur-sm border border-border/30">
              <TabsTrigger value="threads">
                <MessageSquare className="h-4 w-4 mr-2" />
                Threads
              </TabsTrigger>
              <TabsTrigger value="categories">
                <MessageSquare className="h-4 w-4 mr-2" />
                Categories
              </TabsTrigger>
              <TabsTrigger value="reports">
                <Flag className="h-4 w-4 mr-2" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="trash">
                <Trash2 className="h-4 w-4 mr-2" />
                Trash
              </TabsTrigger>
            </TabsList>
            <TabsContent value="threads" className="mt-6">
              <AdminForumThreads />
            </TabsContent>
            <TabsContent value="categories" className="mt-6">
              <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-border/30 p-6">
                <h2 className="text-xl font-bold mb-4">Forum Categories</h2>
                <p className="text-muted-foreground">
                  Manage forum categories, create new ones, or edit existing ones.
                </p>
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">Category management interface coming soon</p>
                  <NeonButton variant="blue">Create Category</NeonButton>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reports" className="mt-6">
              <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-border/30 p-6">
                <h2 className="text-xl font-bold mb-4">Reported Content</h2>
                <p className="text-muted-foreground">Review and moderate content that has been reported by users.</p>
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No reported content at this time</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="users" className="mt-6">
              <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-border/30 p-6">
                <h2 className="text-xl font-bold mb-4">User Management</h2>
                <p className="text-muted-foreground">Manage user roles, permissions, and forum access.</p>
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">User management interface coming soon</p>
                  <NeonButton variant="blue">View Users</NeonButton>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="trash" className="mt-6">
              <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-border/30 p-6">
                <h2 className="text-xl font-bold mb-4">Deleted Content</h2>
                <p className="text-muted-foreground">View and restore deleted threads and posts.</p>
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No deleted content in the last 30 days</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
