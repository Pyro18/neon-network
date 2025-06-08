"use client"

import { useState } from "react"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { 
  MessageSquare, 
  Users, 
  HelpCircle, 
  Lightbulb, 
  Hammer,
  Plus 
} from "lucide-react"

import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { NeonButton } from "@/components/neon-button"
import { RoleGate } from "@/components/auth/role-gate"

const categorySchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }).max(50),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }).max(200),
  icon: z.string(),
  color: z.string(),
  sort_order: z.number().int().min(0)
})

export function AdminCategoryForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "MessageSquare",
      color: "default",
      sort_order: 0
    }
  })

  const onSubmit = async (data: z.infer<typeof categorySchema>) => {
    setIsSubmitting(true)
    try {
      // In a real app, this would call an API endpoint
      const response = await fetch('/api/admin/forum/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create category")
      }

      toast.success("Category created successfully")
      form.reset()
    } catch (error) {
      console.error("Error creating category:", error)
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const unauthorizedContent = (
    <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-border/30 p-6 text-center">
      <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
      <p className="text-muted-foreground">
        You need admin permissions to create forum categories.
      </p>
    </div>
  )

  return (
    <RoleGate requiredRole="admin" fallback={unauthorizedContent}>
      <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-border/30 p-6">
        <h2 className="text-xl font-bold mb-4">Create New Category</h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Announcements, Help & Support"
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of the category"
                      className="bg-background/50 resize-none h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder="Select an icon" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MessageSquare">
                          <div className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            <span>Message</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Users">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            <span>Users</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="HelpCircle">
                          <div className="flex items-center">
                            <HelpCircle className="h-4 w-4 mr-2" />
                            <span>Help</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Lightbulb">
                          <div className="flex items-center">
                            <Lightbulb className="h-4 w-4 mr-2" />
                            <span>Idea</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Hammer">
                          <div className="flex items-center">
                            <Hammer className="h-4 w-4 mr-2" />
                            <span>Development</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Color Theme</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-wrap gap-3"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="default" id="color-default" />
                          <Label htmlFor="color-default" className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-primary mr-2"></div>
                            <span>Cyan</span>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="blue" id="color-blue" />
                          <Label htmlFor="color-blue" className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                            <span>Blue</span>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="purple" id="color-purple" />
                          <Label htmlFor="color-purple" className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-purple-500 mr-2"></div>
                            <span>Purple</span>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="green" id="color-green" />
                          <Label htmlFor="color-green" className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                            <span>Green</span>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="pink" id="color-pink" />
                          <Label htmlFor="color-pink" className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-pink-500 mr-2"></div>
                            <span>Pink</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sort_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort Order</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      min="0"
                      className="bg-background/50 w-20"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <NeonButton type="submit" disabled={isSubmitting}>
                <Plus className="h-4 w-4 mr-2" />
                {isSubmitting ? "Creating..." : "Create Category"}
              </NeonButton>
            </div>
          </form>
        </Form>
      </div>
    </RoleGate>
  )
}