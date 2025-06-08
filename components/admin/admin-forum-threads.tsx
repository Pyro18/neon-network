"use client"

/**
 * Componente di amministrazione per i thread del forum
 * 
 * Funzionalità:
 * - Visualizzazione tabellare di tutti i thread
 * - Ricerca e filtro per categoria/autore
 * - Selezione multipla con azioni batch
 * - Modifica proprietà thread (pin, lock, delete)
 * - Moderazione contenuti
 * - Statistiche thread (visualizzazioni, risposte)
 */

import { useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Pin, Lock, Edit, Trash2, MoreHorizontal, Eye, MessageSquare } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// Dati di esempio - in un'app reale verrebbero dal database
const threads = [
  {
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
    replies: 24,
    views: 1245,
    isPinned: true,
    isLocked: false,
  },
  {
    id: "5",
    title: "Server Rules - READ BEFORE POSTING",
    category: {
      id: "announcements",
      name: "Announcements",
    },
    author: {
      name: "NeonAdmin",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "admin",
    },
    createdAt: "2023-01-01T00:00:00Z",
    replies: 0,
    views: 15678,
    isPinned: true,
    isLocked: true,
  },
  {
    id: "2",
    title: "My underwater neon city build",
    category: {
      id: "creations",
      name: "Player Creations",
    },
    author: {
      name: "NeonBuilder",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "member",
    },
    createdAt: "2023-06-14T14:22:00Z",
    replies: 18,
    views: 342,
    isPinned: false,
    isLocked: false,
  },
  {
    id: "3",
    title: "Can't connect to the server - help!",
    category: {
      id: "support",
      name: "Help & Support",
    },
    author: {
      name: "NewPlayer123",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "member",
    },
    createdAt: "2023-06-14T08:15:00Z",
    replies: 7,
    views: 89,
    isPinned: false,
    isLocked: false,
  },
  {
    id: "4",
    title: "Suggestion: Add more neon-themed biomes",
    category: {
      id: "suggestions",
      name: "Suggestions",
    },
    author: {
      name: "CreativeMind",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "member",
    },
    createdAt: "2023-06-13T22:45:00Z",
    replies: 32,
    views: 410,
    isPinned: false,
    isLocked: false,
  },
]

export function AdminForumThreads() {
  const [selectedThreads, setSelectedThreads] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const filteredThreads = threads.filter(
    (thread) =>
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.category.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSelectAll = () => {
    if (selectedThreads.length === filteredThreads.length) {
      setSelectedThreads([])
    } else {
      setSelectedThreads(filteredThreads.map((thread) => thread.id))
    }
  }

  const handleSelectThread = (threadId: string) => {
    if (selectedThreads.includes(threadId)) {
      setSelectedThreads(selectedThreads.filter((id) => id !== threadId))
    } else {
      setSelectedThreads([...selectedThreads, threadId])
    }
  }

  return (
    <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-border/30 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold">Forum Threads</h2>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Input
            placeholder="Search threads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-background/50 w-full md:w-64"
          />
        </div>
      </div>

      {selectedThreads.length > 0 && (
        <div className="flex items-center gap-2 mb-4 p-2 bg-background/30 rounded-md">
          <span className="text-sm">{selectedThreads.length} selected</span>
          <Button variant="outline" size="sm" className="ml-auto">
            <Pin className="h-4 w-4 mr-2" />
            Pin
          </Button>
          <Button variant="outline" size="sm">
            <Lock className="h-4 w-4 mr-2" />
            Lock
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/30">
              <th className="text-left p-3">
                <Checkbox
                  checked={selectedThreads.length === filteredThreads.length && filteredThreads.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="text-left p-3">Thread</th>
              <th className="text-left p-3 hidden md:table-cell">Category</th>
              <th className="text-left p-3 hidden md:table-cell">Author</th>
              <th className="text-left p-3 hidden md:table-cell">Created</th>
              <th className="text-left p-3 hidden md:table-cell">Stats</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredThreads.map((thread) => (
              <tr key={thread.id} className="border-b border-border/30 hover:bg-background/30">
                <td className="p-3">
                  <Checkbox
                    checked={selectedThreads.includes(thread.id)}
                    onCheckedChange={() => handleSelectThread(thread.id)}
                  />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{thread.title}</div>
                    {thread.isPinned && <Pin className="h-3 w-3 text-primary" />}
                    {thread.isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                  </div>
                </td>
                <td className="p-3 hidden md:table-cell">
                  <Badge variant="outline" className="bg-background/30">
                    {thread.category.name}
                  </Badge>
                </td>
                <td className="p-3 hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={thread.author.avatar || "/placeholder.svg"} alt={thread.author.name} />
                      <AvatarFallback>{thread.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span
                      className={cn(
                        thread.author.role === "admin" && "text-primary",
                        thread.author.role === "moderator" && "text-blue-500",
                      )}
                    >
                      {thread.author.name}
                    </span>
                  </div>
                </td>
                <td className="p-3 hidden md:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
                  </span>
                </td>
                <td className="p-3 hidden md:table-cell">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      <span>{thread.replies}</span>
                    </div>
                    <div className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      <span>{thread.views}</span>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/forum/thread/${thread.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                    </Link>
                    <Link href={`/admin/forum/edit/${thread.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pin className="h-4 w-4 mr-2" />
                          {thread.isPinned ? "Unpin" : "Pin"}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Lock className="h-4 w-4 mr-2" />
                          {thread.isLocked ? "Unlock" : "Lock"}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
            {filteredThreads.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-muted-foreground">
                  No threads found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
