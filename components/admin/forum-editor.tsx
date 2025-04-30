"use client"

import { useState } from "react"
import { Bold, Italic, List, ListOrdered, ImageIcon, LinkIcon, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Markdown } from "@/components/forum/markdown"

interface ForumEditorProps {
  content: string
  onChange: (content: string) => void
}

export function ForumEditor({ content, onChange }: ForumEditorProps) {
  const [activeTab, setActiveTab] = useState<string>("write")

  const insertMarkdown = (markdownSyntax: string) => {
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)

    let newText = ""

    switch (markdownSyntax) {
      case "bold":
        newText = `**${selectedText || "bold text"}**`
        break
      case "italic":
        newText = `*${selectedText || "italic text"}*`
        break
      case "list":
        newText = `\n- ${selectedText || "List item"}\n- Another item\n- And another`
        break
      case "ordered-list":
        newText = `\n1. ${selectedText || "First item"}\n2. Second item\n3. Third item`
        break
      case "image":
        newText = `![${selectedText || "Image description"}](https://example.com/image.jpg)`
        break
      case "link":
        newText = `[${selectedText || "Link text"}](https://example.com)`
        break
      case "code":
        newText = selectedText ? `\`\`\`\n${selectedText}\n\`\`\`` : "```\ncode block\n```"
        break
      default:
        newText = selectedText
    }

    const newContent = content.substring(0, start) + newText + content.substring(end)
    onChange(newContent)

    // Set focus back to textarea
    setTimeout(() => {
      textarea.focus()
      textarea.selectionStart = start + newText.length
      textarea.selectionEnd = start + newText.length
    }, 0)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 p-2 bg-background/30 rounded-md">
        <Button type="button" variant="ghost" size="sm" onClick={() => insertMarkdown("bold")} title="Bold">
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => insertMarkdown("italic")} title="Italic">
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => insertMarkdown("list")} title="Bullet List">
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown("ordered-list")}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => insertMarkdown("image")} title="Image">
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => insertMarkdown("link")} title="Link">
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => insertMarkdown("code")} title="Code Block">
          <Code className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="write" onValueChange={setActiveTab}>
        <TabsList className="bg-background/30">
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="preview" disabled={!content}>
            Preview
          </TabsTrigger>
        </TabsList>
        <TabsContent value="write" className="mt-4">
          <Textarea
            placeholder="Write your content here... Markdown is supported."
            className="min-h-[300px] bg-background/20 backdrop-blur-sm border-border/30"
            value={content}
            onChange={(e) => onChange(e.target.value)}
          />
        </TabsContent>
        <TabsContent value="preview" className="mt-4">
          <div className="min-h-[300px] p-4 rounded-md border border-border/30 bg-background/20 backdrop-blur-sm">
            {content ? <Markdown content={content} /> : <p className="text-muted-foreground">Nothing to preview</p>}
          </div>
        </TabsContent>
      </Tabs>

      <div className="text-xs text-muted-foreground">
        <p>Markdown formatting is supported. You can use **bold**, *italic*, lists, and more.</p>
      </div>
    </div>
  )
}
