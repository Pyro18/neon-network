import Link from "next/link"
import { ChevronRight, Flag, Share2 } from "lucide-react"
import { NeonParticles } from "@/components/neon-particles"
import { NeonButton } from "@/components/neon-button"
import { ForumPost } from "@/components/forum/forum-post"
import { ForumReplyForm } from "@/components/forum/forum-reply-form"
import { Badge } from "@/components/ui/badge"

// Mock di dati per i thread e i post 
// Nel sito reale, questi verrebbero recuperati da un'API o da un database
const threads = {
  "1": {
    id: "1",
    title: "Summer Event Announcement",
    category: {
      id: "announcements",
      name: "Announcements",
    },
    author: {
      name: "NeonAdmin",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "admin",
    },
    createdAt: "2023-06-15T10:30:00Z",
    content: `
# Summer Event 2023: Neon Nights

We're excited to announce our biggest summer event yet! Starting June 20th and running until August 15th, join us for special challenges, unique rewards, and exciting new game modes.

## Event Highlights

- **New Neon Beach Area**: Explore our custom-built beach area with neon palm trees, glowing waters, and hidden treasures.
- **Daily Challenges**: Complete daily tasks to earn event tokens.
- **Limited Edition Items**: Spend your tokens on exclusive summer-themed items that won't be available after the event.
- **Neon Surfing Minigame**: Try out our new surfing minigame with procedurally generated waves!

## Schedule

- June 20th: Event Launch Party (6 PM EST)
- July 4th: Fireworks Spectacular
- July 15th: Midway Tournament
- August 15th: Closing Ceremony

We hope to see you all there!
    `,
    replies: 24,
    views: 1245,
    isPinned: true,
    isLocked: false,
  },
}

const posts = {
  "1": [
    {
      id: "post-1",
      threadId: "1",
      author: {
        name: "NeonAdmin",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "admin",
        joinDate: "2022-01-01T00:00:00Z",
        posts: 1245,
      },
      createdAt: "2023-06-15T10:30:00Z",
      content: `
# Summer Event 2023: Neon Nights

We're excited to announce our biggest summer event yet! Starting June 20th and running until August 15th, join us for special challenges, unique rewards, and exciting new game modes.

## Event Highlights

- **New Neon Beach Area**: Explore our custom-built beach area with neon palm trees, glowing waters, and hidden treasures.
- **Daily Challenges**: Complete daily tasks to earn event tokens.
- **Limited Edition Items**: Spend your tokens on exclusive summer-themed items that won't be available after the event.
- **Neon Surfing Minigame**: Try out our new surfing minigame with procedurally generated waves!

## Schedule

- June 20th: Event Launch Party (6 PM EST)
- July 4th: Fireworks Spectacular
- July 15th: Midway Tournament
- August 15th: Closing Ceremony

We hope to see you all there!
      `,
      isOriginalPost: true,
    },
    {
      id: "post-2",
      threadId: "1",
      author: {
        name: "CyberGamer",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
        joinDate: "2022-03-15T00:00:00Z",
        posts: 87,
      },
      createdAt: "2023-06-15T11:05:00Z",
      content: "This looks amazing! I can't wait for the surfing minigame. Will there be a leaderboard for it?",
      isOriginalPost: false,
    },
    {
      id: "post-3",
      threadId: "1",
      author: {
        name: "NeonAdmin",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "admin",
        joinDate: "2022-01-01T00:00:00Z",
        posts: 1245,
      },
      createdAt: "2023-06-15T11:30:00Z",
      content: "Yes, there will be a leaderboard for the surfing minigame with weekly prizes for the top performers!",
      isOriginalPost: false,
    },
    {
      id: "post-4",
      threadId: "1",
      author: {
        name: "BuildMaster",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
        joinDate: "2022-02-10T00:00:00Z",
        posts: 342,
      },
      createdAt: "2023-06-15T12:15:00Z",
      content: "Will the neon beach area remain after the event or is it temporary?",
      isOriginalPost: false,
    },
    {
      id: "post-5",
      threadId: "1",
      author: {
        name: "NeonModerator",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "moderator",
        joinDate: "2022-01-15T00:00:00Z",
        posts: 876,
      },
      createdAt: "2023-06-15T13:00:00Z",
      content:
        "The beach area will remain after the event, but some of the special event features will be removed. We've put a lot of work into building it, so we want players to enjoy it year-round!",
      isOriginalPost: false,
    },
  ],
}

export default function ThreadPage({ params }: { params: { id: string } }) {
  const thread = threads[params.id as keyof typeof threads]
  const threadPosts = posts[params.id as keyof typeof posts] || []

  if (!thread) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold">Thread not found</h1>
        <p className="mt-4">The thread you're looking for doesn't exist.</p>
        <Link href="/forum" className="text-primary hover:underline mt-4 inline-block">
          Return to forum
        </Link>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      <NeonParticles density={30} />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/forum" className="hover:text-primary">
            Forum
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/forum/category/${thread.category.id}`} className="hover:text-primary">
            {thread.category.name}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground truncate max-w-[200px]">{thread.title}</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl font-bold tracking-tight">{thread.title}</h1>
              {thread.isPinned && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  Pinned
                </Badge>
              )}
              {thread.isLocked && (
                <Badge variant="outline" className="bg-muted/10 text-muted-foreground border-muted/30">
                  Locked
                </Badge>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <NeonButton variant="blue" size="sm">
              <Flag className="h-4 w-4 mr-2" />
              Report
            </NeonButton>
            <NeonButton variant="blue" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </NeonButton>
          </div>
        </div>

        <div className="space-y-6">
          {threadPosts.map((post) => (
            <ForumPost key={post.id} post={post} />
          ))}
        </div>

        {!thread.isLocked ? (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Post a Reply</h2>
            <ForumReplyForm threadId={thread.id} />
          </div>
        ) : (
          <div className="mt-8 p-6 bg-background/20 backdrop-blur-sm rounded-lg border border-border/30 text-center">
            <h2 className="text-xl font-bold mb-2">This thread is locked</h2>
            <p className="text-muted-foreground">
              You cannot reply to this thread because it has been locked by a moderator.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
