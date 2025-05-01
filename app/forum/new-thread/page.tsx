"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"

import { NeonParticles } from "@/components/neon-particles"
import { NeonButton } from "@/components/neon-button"
import { ForumEditor } from "@/components/forum/forum-editor"
import { RoleGate } from "@/components/auth/role-gate"
import { useCreateThread } from "@/hooks/use-forum"
import { useForumCategories } from "@/hooks/use-forum"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"

const threadSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Title must be at least 5 characters" })
    .max(100, { message: "Title must be at most 100 characters" }),
  categoryId: z.string().min(1, { message: "Please select a category" }),
  content: z.string().min(10, { message: "Content must be at least 10 characters" }),
})

export default function NewThreadPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { categories, isLoading: categoriesLoading } = useForumCategories()
  const { createNewThread, isSubmitting } = useCreateThread()
  const [content, setContent] = useState("")

  const form = useForm<z.infer<typeof threadSchema>>({
    resolver: zodResolver(threadSchema),
    defaultValues: {
      title: "",
      categoryId: "",
      content: "",
    },
  })

  // Update the content field when editor content changes
  const handleEditorChange = (newContent: string) => {
    setContent(newContent)
    form.setValue("content", newContent, { shouldValidate: true })
  }

  const onSubmit = async (values: z.infer<typeof threadSchema>) => {
    if (!user) {
      toast.error("You must be logged in to create a thread")
      return
    }

    try {
      const result = await createNewThread({
        title: values.title,
        content: values.content,
        categoryId: values.categoryId,
      })

      if (!result.success) {
        throw new Error(result.error instanceof Error ? result.error.message : "Failed to create thread")
      }

      toast.success("Thread created successfully!")
      router.push(`/forum/thread/${result.threadId}`)
    } catch (error) {
      console.error("Error creating thread:", error)
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred")
    }
  }

  // Define the role IDs that are allowed to create threads
  // You should replace these with your actual Discord role IDs
  const allowedRoleIds = [
    process.env.NEXT_PUBLIC_DISCORD_MANAGER_ROLE_ID,
    process.env.NEXT_PUBLIC_DISCORD_MODERATOR_ROLE_ID,
  ].filter(Boolean) as string[]

  // Content to show for users without the required permissions
  const unauthorizedContent = (
    <div className="container mx-auto px-4 py-12 relative z-10">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/forum" className="hover:text-primary flex items-center">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Forum
        </Link>
      </div>

      <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-border/30 p-6 max-w-3xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Permission Required</h1>
        <p className="text-muted-foreground mb-6">
          You need to have the Manager or Moderator role on Discord to create new threads in the forum.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/forum">
            <Button variant="outline">Return to Forum</Button>
          </Link>
          <Link href="/auth/login">
            <NeonButton variant="blue">Sign In with Discord</NeonButton>
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="relative min-h-screen">
      <NeonParticles density={30} />

      <RoleGate requiredRoleIds={allowedRoleIds} fallback={unauthorizedContent}>
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/forum" className="hover:text-primary flex items-center">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Forum
            </Link>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Create New Thread</h1>
              <p className="text-muted-foreground">Start a new discussion in the forum</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto">
              <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-border/30 p-6">
                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thread Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter a descriptive title for your thread"
                            className="bg-background/50"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background/50">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categoriesLoading ? (
                              <SelectItem value="loading" disabled>
                                Loading categories...
                              </SelectItem>
                            ) : (
                              categories?.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-border/30 p-6">
                <Label className="mb-4 block">Thread Content</Label>
                <FormField
                  control={form.control}
                  name="content"
                  render={() => (
                    <FormItem>
                      <FormControl>
                        <ForumEditor content={content} onChange={handleEditorChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Link href="/forum">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <NeonButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Thread"}
                </NeonButton>
              </div>
            </form>
          </Form>
        </div>
      </RoleGate>
    </div>
  )
}