"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { RoleGate } from "@/components/auth/role-gate"
import { NeonButton } from "@/components/neon-button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import Link from "next/link"

interface ForumReplyFormProps {
  threadId: string
}

export function ForumReplyForm({ threadId }: ForumReplyFormProps) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()

  const handleSubmit = async () => {
    if (!content.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/forum', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_post',
          threadId,
          content,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create post')
      }

      toast.success('Reply posted successfully')
      setContent("")
      // You might want to trigger a refresh of the thread here
    } catch (error) {
      console.error('Error posting reply:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to post reply')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-border/30 p-6 text-center">
        <p className="text-muted-foreground mb-4">You need to be logged in to reply to this thread.</p>
        <Link href="/auth/login">
          <NeonButton variant="blue">
            Sign In
          </NeonButton>
        </Link>
      </div>
    )
  }

  // Define the role IDs that are allowed to post
  // You should replace these with your actual Discord role IDs
  const allowedRoleIds = [
    process.env.NEXT_PUBLIC_DISCORD_MANAGER_ROLE_ID,
    process.env.NEXT_PUBLIC_DISCORD_MODERATOR_ROLE_ID,
  ].filter(Boolean) as string[]

  return (
    <RoleGate
      requiredRoleIds={allowedRoleIds}
      fallback={
        <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-border/30 p-6 text-center">
          <p className="text-muted-foreground">You need to have the Manager or Moderator role on Discord to post replies.</p>
        </div>
      }
    >
      <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-border/30 p-6">
        <Textarea
          placeholder="Write your reply here... Markdown is supported."
          className="min-h-[200px] bg-background/20 backdrop-blur-sm border-border/30"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSubmitting}
        />
        <div className="mt-4 flex justify-end">
          <NeonButton
            onClick={handleSubmit}
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? "Posting..." : "Post Reply"}
          </NeonButton>
        </div>
      </div>
    </RoleGate>
  )
}
