"use client"

import { useState } from "react"
import { formatDistanceToNow, format } from "date-fns"
import { ThumbsUp, Flag, Reply, MoreHorizontal } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Markdown } from "@/components/forum/markdown"

interface ForumPostProps {
  post: {
    id: string
    threadId: string
    author: {
      name: string
      avatar: string
      role: string
      joinDate: string
      posts: number
    }
    createdAt: string
    content: string
    isOriginalPost: boolean
  }
}

export function ForumPost({ post }: ForumPostProps) {
  const [likes, setLikes] = useState(Math.floor(Math.random() * 10))
  const [liked, setLiked] = useState(false)
  const formattedDate = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
  const exactDate = format(new Date(post.createdAt), "PPP 'at' p")

  const handleLike = () => {
    if (liked) {
      setLikes(likes - 1)
    } else {
      setLikes(likes + 1)
    }
    setLiked(!liked)
  }

  return (
    <div
      id={`post-${post.id}`}
      className={cn(
        "rounded-lg border border-border/30 bg-background/20 backdrop-blur-sm overflow-hidden",
        post.isOriginalPost && "border-primary/30",
      )}
    >
      <div className="flex flex-col md:flex-row">
        {/* Author sidebar */}
        <div className="p-4 md:w-48 md:border-r border-border/30 flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-2 bg-background/10">
          <Avatar className="h-10 w-10 md:h-16 md:w-16 border border-border/50">
            <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  "font-medium",
                  post.author.role === "admin" && "text-primary",
                  post.author.role === "moderator" && "text-blue-500",
                )}
              >
                {post.author.name}
              </span>
              {post.author.role !== "member" && (
                <Badge
                  className={cn(
                    "text-xs",
                    post.author.role === "admin" && "bg-primary/20 text-primary hover:bg-primary/30",
                    post.author.role === "moderator" && "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30",
                  )}
                >
                  {post.author.role}
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1 hidden md:block">
              <div>Joined {format(new Date(post.author.joinDate), "MMM yyyy")}</div>
              <div>{post.author.posts} posts</div>
            </div>
          </div>
        </div>

        {/* Post content */}
        <div className="flex-1 p-4 md:p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="text-sm text-muted-foreground" title={exactDate}>
              Posted {formattedDate}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Flag className="h-4 w-4 mr-2" />
                  Report
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Reply className="h-4 w-4 mr-2" />
                  Quote
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="prose prose-invert max-w-none">
            <Markdown content={post.content} />
          </div>

          <div className="flex justify-between items-center mt-6 pt-4 border-t border-border/30">
            <Button
              variant="ghost"
              size="sm"
              className={cn("text-muted-foreground hover:text-primary hover:bg-primary/10", liked && "text-primary")}
              onClick={handleLike}
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              {likes} {likes === 1 ? "like" : "likes"}
            </Button>

            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/10">
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
