import Link from "next/link"
import { MessageSquare, Users, HelpCircle, Lightbulb, Hammer } from "lucide-react"
import { NeonCard } from "@/components/neon-card"
import { cn } from "@/lib/utils"

/**
 * Proprietà per il componente carta categoria forum
 */
interface ForumCategoryCardProps {
  category: {
    id: string
    name: string
    description: string
    icon: string
    threads: number
    posts: number
    color: string
  }
}

/**
 * Componente carta per mostrare una categoria del forum
 * 
 * Visualizza informazioni di una categoria inclusi:
 * - Nome e descrizione
 * - Icona associata
 * - Conteggio thread e post
 * - Link per navigare alla categoria
 */
export function ForumCategoryCard({ category }: ForumCategoryCardProps) {
  // Funzione per ottenere l'icona appropriata in base al tipo
  const getIcon = () => {
    switch (category.icon) {
      case "MessageSquare":
        return <MessageSquare className="h-5 w-5" />
      case "Users":
        return <Users className="h-5 w-5" />
      case "HelpCircle":
        return <HelpCircle className="h-5 w-5" />
      case "Lightbulb":
        return <Lightbulb className="h-5 w-5" />
      case "Hammer":
        return <Hammer className="h-5 w-5" />
      default:
        return <MessageSquare className="h-5 w-5" />
    }
  }

  return (
    <Link href={`/forum/category/${category.id}`}>
      <NeonCard variant={category.color as any} className="transition-all hover:translate-y-[-2px] hover:shadow-lg">
        <div className="p-4 flex items-start gap-4">
          <div
            className={cn(
              "flex-shrink-0 w-10 h-10 rounded-md flex items-center justify-center",
              category.color === "blue" && "bg-blue-500/10 text-blue-500",
              category.color === "purple" && "bg-purple-500/10 text-purple-500",
              category.color === "green" && "bg-green-500/10 text-green-500",
              category.color === "pink" && "bg-pink-500/10 text-pink-500",
              category.color === "default" && "bg-primary/10 text-primary",
            )}
          >
            {getIcon()}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold mb-1">{category.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">{category.description}</p>

            <div className="flex text-xs text-muted-foreground">
              <div className="flex items-center mr-4">
                <MessageSquare className="h-3 w-3 mr-1" />                <span>{category.threads} thread</span>
              </div>
              <div className="flex items-center">
                <MessageSquare className="h-3 w-3 mr-1" />
                <span>{category.posts} post</span>
              </div>
            </div>
          </div>
        </div>
      </NeonCard>
    </Link>
  )
}
