"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism"

interface MarkdownProps {
  content: string
}

/**
 * Componente per il rendering di contenuti Markdown.
 * Utilizza react-markdown e remark-gfm per supportare sintassi GitHub Flavored Markdown.
 * Include evidenziazione della sintassi per i blocchi di codice e stili personalizzati per gli elementi Markdown.
 *
 * @param {MarkdownProps} props - Le proprietà del componente.
 * @param {string} props.content - Il contenuto Markdown da renderizzare.
 */

export function Markdown({ content }: MarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // @ts-ignore - Type issues with react-markdown components
        code: ({ node, inline, className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || "")
          return !inline && match ? (
            <SyntaxHighlighter style={atomDark} language={match[1]} PreTag="div" className="rounded-md my-4" {...props}>
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code className="bg-background/50 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
              {children}
            </code>
          )
        },
        // Apply consistent styling to elements
        h1: ({ children, ...props }: any) => (
          <h1 className="text-2xl font-bold mt-6 mb-4 text-foreground" {...props}>
            {children}
          </h1>
        ),
        h2: ({ children, ...props }: any) => (
          <h2 className="text-xl font-bold mt-5 mb-3 text-foreground" {...props}>
            {children}
          </h2>
        ),
        h3: ({ children, ...props }: any) => (
          <h3 className="text-lg font-bold mt-4 mb-2 text-foreground" {...props}>
            {children}
          </h3>
        ),
        p: ({ children, ...props }: any) => (
          <p className="mb-4 text-foreground" {...props}>
            {children}
          </p>
        ),
        a: ({ children, ...props }: any) => (
          <a className="text-primary hover:underline" {...props}>
            {children}
          </a>
        ),
        ul: ({ children, ...props }: any) => (
          <ul className="list-disc pl-6 mb-4" {...props}>
            {children}
          </ul>
        ),
        ol: ({ children, ...props }: any) => (
          <ol className="list-decimal pl-6 mb-4" {...props}>
            {children}
          </ol>
        ),
        li: ({ children, ...props }: any) => (
          <li className="mb-1" {...props}>
            {children}
          </li>
        ),
        blockquote: ({ children, ...props }: any) => (
          <blockquote className="border-l-4 border-primary/50 pl-4 italic my-4" {...props}>
            {children}
          </blockquote>
        ),
        table: ({ children, ...props }: any) => (
          <div className="overflow-x-auto my-4">
            <table className="w-full border-collapse" {...props}>
              {children}
            </table>
          </div>
        ),
        thead: ({ children, ...props }: any) => (
          <thead className="bg-background/30" {...props}>
            {children}
          </thead>
        ),
        tbody: ({ children, ...props }: any) => (
          <tbody {...props}>{children}</tbody>
        ),
        tr: ({ children, ...props }: any) => (
          <tr className="border-b border-border/30" {...props}>
            {children}
          </tr>
        ),
        th: ({ children, ...props }: any) => (
          <th className="px-4 py-2 text-left font-medium" {...props}>
            {children}
          </th>
        ),
        td: ({ children, ...props }: any) => (
          <td className="px-4 py-2" {...props}>
            {children}
          </td>
        ),
        img: ({ ...props }: any) => (
          <img className="max-w-full h-auto rounded-md my-4" {...props} />
        ),
        hr: ({ ...props }: any) => (
          <hr className="my-6 border-border/30" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
