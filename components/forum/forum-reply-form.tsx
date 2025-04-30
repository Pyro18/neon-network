"use client"

import type React from "react"

import { useState } from "react"
import { NeonButton } from "@/components/neon-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Markdown } from "@/components/forum/markdown"

interface ForumReplyFormProps {
  threadId: string
}

export function ForumReplyForm({ threadId }: ForumReplyFormProps) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      console.log("Submitting reply:", { threadId, content })
      setIsSubmitting(false)
      setContent("")
      // In a real app, you would add the new post to the thread
    }, 1000)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="write">
        <TabsList className="bg-background/20 backdrop-blur-sm border border-border/30">
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="preview" disabled={!content}>
            Preview
          </TabsTrigger>
        </TabsList>
        <TabsContent value="write" className="mt-4">
          <Textarea
            placeholder="Write your reply here... Markdown is supported."
            className="min-h-[200px] bg-background/20 backdrop-blur-sm border-border/30"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
          />
        </TabsContent>
        <TabsContent value="preview" className="mt-4">
          <div className="min-h-[200px] p-4 rounded-md border border-border/30 bg-background/20 backdrop-blur-sm">
            {content ? <Markdown content={content} /> : <p className="text-muted-foreground">Nothing to preview</p>}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-4">
        <NeonButton type="submit" disabled={!content.trim() || isSubmitting}>
          {isSubmitting ? "Posting..." : "Post Reply"}
        </NeonButton>
      </div>
    </form>
  )
}
