"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Pin, Lock, MessageSquare, Eye } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ForumThread } from "@/lib/forum"

interface ForumThreadItemProps {
  thread: ForumThread
  compact?: boolean
}

export function ForumThreadItem({ thread, compact = false }: ForumThreadItemProps) {
  // Formatta la data relativa (es. "2 giorni fa")
  const formattedDate = formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })
  
  // Versione compatta per sidebar o liste compatte
  if (compact) {
    return (
      <Link
        href={`/forum/thread/${thread.id}`}
        className="block p-3 rounded-md border border-border/30 bg-background/20 backdrop-blur-sm hover:bg-background/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border border-border/50">
            <AvatarImage 
              src={thread.author?.avatar_url || "/placeholder.svg"} 
              alt={thread.author?.username || "User"} 
            />
            <AvatarFallback>{(thread.author?.username || "U").charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={cn("text-sm font-medium truncate", thread.is_pinned && "text-primary")}>
                {thread.title}
              </h3>
              {thread.is_pinned && <Pin className="h-3 w-3 text-primary flex-shrink-0" />}
              {thread.is_locked && <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <span>{thread.author?.username || "Unknown"}</span>
              <span>•</span>
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // Versione completa per pagine elenco thread
  return (
    <Link
      href={`/forum/thread/${thread.id}`}
      className="block p-4 rounded-lg border border-border/30 bg-background/20 backdrop-blur-sm hover:bg-background/30 transition-colors"
    >
      <div className="flex items-start gap-4">
        <Avatar className="h-10 w-10 border border-border/50">
          <AvatarImage 
            src={thread.author?.avatar_url || "/placeholder.svg"} 
            alt={thread.author?.username || "User"} 
          />
          <AvatarFallback>{(thread.author?.username || "U").charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={cn("text-lg font-medium", thread.is_pinned && "text-primary")}>
              {thread.title}
            </h3>
            {thread.is_pinned && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                <Pin className="h-3 w-3 mr-1" /> Pinned
              </Badge>
            )}
            {thread.is_locked && (
              <Badge variant="outline" className="bg-muted/10 text-muted-foreground border-muted/30">
                <Lock className="h-3 w-3 mr-1" /> Locked
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <span
              className={cn(
                (thread.author?.role === "admin") && "text-primary",
                (thread.author?.role === "moderator") && "text-blue-500",
              )}
            >
              {thread.author?.username || "Unknown"}
            </span>
            <span>•</span>
            <span>{formattedDate}</span>
            {thread.category && (
              <>
                <span>•</span>
                <span className="text-muted-foreground">
                  {thread.category.name}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <div className="flex items-center">
              <MessageSquare className="h-3 w-3 mr-1" />
              <span>{thread.reply_count || 0} replies</span>
            </div>
            <div className="flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              <span>{thread.views || 0} views</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}