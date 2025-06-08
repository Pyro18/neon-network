"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { NeonParticles } from "@/components/neon-particles"
import { NeonButton } from "@/components/neon-button"
import { ForumEditor } from "@/components/admin/forum-editor"
import { MediaUploader } from "@/components/admin/media-uploader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export default function CreateThreadPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [content, setContent] = useState("")
  const [isPinned, setIsPinned] = useState(false)
  const [isLocked, setIsLocked] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !category || !content) return

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      console.log("Creating thread:", { title, category, content, isPinned, isLocked })
      setIsSubmitting(false)
      // In a real app, you would redirect to the new thread
    }, 1000)
  }

  return (
    <div className="relative min-h-screen">
      <NeonParticles density={30} />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/admin/forum" className="hover:text-primary flex items-center">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Admin
          </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Create New Thread</h1>
            <p className="text-muted-foreground">Create a new thread in the forum as an administrator</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-border/30 p-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Thread Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter thread title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-background/50"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger id="category" className="bg-background/50">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="announcements">Announcements</SelectItem>
                      <SelectItem value="general">General Discussion</SelectItem>
                      <SelectItem value="support">Help & Support</SelectItem>
                      <SelectItem value="suggestions">Suggestions</SelectItem>
                      <SelectItem value="creations">Player Creations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="pinned" checked={isPinned} onCheckedChange={setIsPinned} />
                    <Label htmlFor="pinned">Pin Thread</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="locked" checked={isLocked} onCheckedChange={setIsLocked} />
                    <Label htmlFor="locked">Lock Thread</Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-border/30 p-6">
              <Tabs defaultValue="editor">
                <TabsList className="bg-background/30">
                  <TabsTrigger value="editor">Content</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                </TabsList>
                <TabsContent value="editor" className="mt-4">
                  <ForumEditor content={content} onChange={setContent} />
                </TabsContent>
                <TabsContent value="media" className="mt-4">
                  <MediaUploader />
                </TabsContent>
              </Tabs>
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/admin/forum">
                <NeonButton variant="blue" type="button">
                  Cancel
                </NeonButton>
              </Link>
              <NeonButton type="submit" disabled={isSubmitting || !title || !category || !content}>
                {isSubmitting ? "Creating..." : "Create Thread"}
              </NeonButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
