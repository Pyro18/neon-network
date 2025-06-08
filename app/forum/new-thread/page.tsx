"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"

import { NeonParticles } from "@/components/neon-particles"
import { NeonButton } from "@/components/neon-button"
import { ForumEditor } from "@/components/forum/forum-editor"
import { RoleGate } from "@/components/auth/role-gate"
import { useCreateThread, useForumCategories } from "@/hooks/use-forum"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
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
import { cn } from "@/lib/utils"

const threadSchema = z.object({
    title: z
        .string()
        .min(5, { message: "Title must be at least 5 characters" })
        .max(100, { message: "Title must be at most 100 characters" }),
    categoryId: z.string().min(1, { message: "Please select a category" }),
    content: z.string().min(10, { message: "Content must be at least 10 characters" }),
    isPinned: z.boolean(),
    isLocked: z.boolean(),
})

type ThreadFormData = z.infer<typeof threadSchema>

export default function NewThreadPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user, profile } = useAuth()
    const { categories, isLoading: categoriesLoading } = useForumCategories()
    const { createNewThread, isSubmitting, error } = useCreateThread()
    const [content, setContent] = useState("")

    // Pre-selected category from URL
    const preSelectedCategoryId = searchParams.get('category')
    const [selectedCategory, setSelectedCategory] = useState<any>(null)
    const [breadcrumbPath, setBreadcrumbPath] = useState<string[]>(['Forum'])

    const form = useForm<ThreadFormData>({
        resolver: zodResolver(threadSchema),
        defaultValues: {
            title: "",
            categoryId: preSelectedCategoryId || "",
            content: "",
            isPinned: false,
            isLocked: false,
        },
    })

    // Set up category and breadcrumb when categories load
    useEffect(() => {
        if (categories && preSelectedCategoryId) {
            const category = categories.find(cat => cat.id === preSelectedCategoryId)
            if (category) {
                setSelectedCategory(category)
                setBreadcrumbPath([
                    'Forum',
                    category.name,
                    'New Thread'
                ])
                form.setValue('categoryId', category.id)
            }
        }
    }, [categories, preSelectedCategoryId, form])

    // Update selected category when form changes
    useEffect(() => {
        const subscription = form.watch((values) => {
            if (values.categoryId && categories) {
                const category = categories.find(cat => cat.id === values.categoryId)
                setSelectedCategory(category)

                if (category) {
                    setBreadcrumbPath([
                        'Forum',
                        category.name,
                        'New Thread'
                    ])
                } else {
                    setBreadcrumbPath(['Forum', 'New Thread'])
                }
            }
        })
        return () => subscription.unsubscribe()
    }, [form, categories])

    const handleEditorChange = (newContent: string) => {
        setContent(newContent)
        form.setValue("content", newContent, { shouldValidate: true })
    }

    const onSubmit = async (values: ThreadFormData) => {
        try {
            const result = await createNewThread({
                title: values.title,
                content: values.content,
                categoryId: values.categoryId,
                isPinned: values.isPinned,
                isLocked: values.isLocked,
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

    const getCategorySlug = (categoryName: string) => {
        return categoryName.toLowerCase().replace(/\s+/g, '-')
    }

    const unauthorizedContent = (
        <div className="container mx-auto px-4 py-12 relative z-10">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <Link href="/forum" className="hover:text-primary flex items-center">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to Forum
                </Link>
            </div>

            <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-border/30 p-6 max-w-3xl mx-auto text-center">
                <h1 className="text-2xl font-bold mb-4">Access Required</h1>
                <p className="text-muted-foreground mb-6">
                    {!user ?
                        "You need to be logged in to create new threads." :
                        profile?.is_banned ?
                            `Your account is suspended: ${profile.ban_reason || 'No reason provided'}` :
                            "You need to have member status or higher to create new threads."
                    }
                </p>
                <div className="flex justify-center gap-4">
                    <Link href="/forum">
                        <Button variant="outline">Return to Forum</Button>
                    </Link>
                    {!user && (
                        <Link href="/auth/login">
                            <NeonButton variant="blue">Sign In</NeonButton>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )

    return (
        <div className="relative min-h-screen">
            <NeonParticles density={30} />

            <RoleGate requiredRole="member" fallback={unauthorizedContent}>
                <div className="container mx-auto px-4 py-12 relative z-10">
                    {/* Dynamic Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                        {breadcrumbPath.map((item, index) => (
                            <div key={index} className="flex items-center">
                                {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
                                {index === 0 ? (
                                    <Link href="/forum" className="hover:text-primary">
                                        {item}
                                    </Link>
                                ) : index === breadcrumbPath.length - 1 ? (
                                    <span className="text-foreground">{item}</span>
                                ) : selectedCategory ? (
                                    <Link
                                        href={`/forum/category/${getCategorySlug(selectedCategory.name)}`}
                                        className="hover:text-primary"
                                    >
                                        {item}
                                    </Link>
                                ) : (
                                    <span>{item}</span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight mb-2">Create New Thread</h1>
                            <div className="flex items-center gap-2">
                                <p className="text-muted-foreground">Start a new discussion</p>
                                {selectedCategory && (
                                    <>
                                        <span className="text-muted-foreground">in</span>
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "bg-background/30",
                                                selectedCategory.color === 'blue' && "border-blue-500/30 text-blue-500",
                                                selectedCategory.color === 'purple' && "border-purple-500/30 text-purple-500",
                                                selectedCategory.color === 'green' && "border-green-500/30 text-green-500",
                                                selectedCategory.color === 'pink' && "border-pink-500/30 text-pink-500",
                                                selectedCategory.color === 'default' && "border-primary/30 text-primary",
                                            )}
                                        >
                                            {selectedCategory.name}
                                        </Badge>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                            <p className="text-destructive text-sm">{error.message}</p>
                        </div>
                    )}

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
                                                <FormLabel className="flex items-center gap-2">
                                                    Category
                                                    {preSelectedCategoryId && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Pre-selected
                                                        </Badge>
                                                    )}
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
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
                                                        ) : categories && categories.length > 0 ? (
                                                            categories.map((category) => (
                                                                <SelectItem key={category.id} value={category.id}>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={cn(
                                                                            "w-3 h-3 rounded-full",
                                                                            category.color === 'blue' && "bg-blue-500",
                                                                            category.color === 'purple' && "bg-purple-500",
                                                                            category.color === 'green' && "bg-green-500",
                                                                            category.color === 'pink' && "bg-pink-500",
                                                                            category.color === 'default' && "bg-primary",
                                                                        )} />
                                                                        {category.name}
                                                                    </div>
                                                                </SelectItem>
                                                            ))
                                                        ) : (
                                                            <SelectItem value="no-categories" disabled>
                                                                No categories available
                                                            </SelectItem>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Moderator/Admin only options */}
                                    <RoleGate requiredRole="moderator">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/30">
                                            <FormField
                                                control={form.control}
                                                name="isPinned"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/30 p-3">
                                                        <div className="space-y-0.5">
                                                            <FormLabel className="text-base">Pin Thread</FormLabel>
                                                            <div className="text-sm text-muted-foreground">
                                                                Keep this thread at the top of the list
                                                            </div>
                                                        </div>
                                                        <FormControl>
                                                            <Switch
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="isLocked"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/30 p-3">
                                                        <div className="space-y-0.5">
                                                            <FormLabel className="text-base">Lock Thread</FormLabel>
                                                            <div className="text-sm text-muted-foreground">
                                                                Prevent replies from other users
                                                            </div>
                                                        </div>
                                                        <FormControl>
                                                            <Switch
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </RoleGate>
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
                                <Link href={selectedCategory ? `/forum/category/${getCategorySlug(selectedCategory.name)}` : "/forum"}>
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