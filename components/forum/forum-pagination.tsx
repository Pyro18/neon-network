import Link from "next/link"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ForumPaginationProps {
  currentPage: number
  totalPages: number
  baseUrl?: string
}

export function ForumPagination({ currentPage, totalPages, baseUrl = "" }: ForumPaginationProps) {
  // Genera i numeri di pagina da visualizzare
  const getPageNumbers = () => {
    const pages = []

    // Mostra sempre la prima pagina
    pages.push(1)

    // Calcola l'intervallo intorno alla pagina corrente
    const rangeStart = Math.max(2, currentPage - 1)
    const rangeEnd = Math.min(totalPages - 1, currentPage + 1)

    // Aggiungi ellipsis se c'è un gap dopo la pagina 1
    if (rangeStart > 2) {
      pages.push("ellipsis-start")
    }

    // Aggiungi le pagine nell'intervallo
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i)
    }

    // Aggiungi ellipsis se c'è un gap prima dell'ultima pagina
    if (rangeEnd < totalPages - 1) {
      pages.push("ellipsis-end")
    }

    // Mostra sempre l'ultima pagina se ci sono più di 1 pagina
    if (totalPages > 1) {
      pages.push(totalPages)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex items-center justify-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        className={cn("bg-background/20 backdrop-blur-sm", currentPage === 1 && "opacity-50 cursor-not-allowed")}
        disabled={currentPage === 1}
        asChild={currentPage !== 1}
      >        {currentPage !== 1 ? (
          <Link href={`${baseUrl}?page=${currentPage - 1}`}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Pagina precedente</span>
          </Link>
        ) : (
          <span>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Pagina precedente</span>
          </span>
        )}
      </Button>

      {pageNumbers.map((page, i) => {
        if (page === "ellipsis-start" || page === "ellipsis-end") {
          return (
            <Button
              key={`ellipsis-${i}`}
              variant="outline"
              size="icon"
              className="bg-background/20 backdrop-blur-sm cursor-default"
              disabled
            >              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Altre pagine</span>
            </Button>
          )
        }

        return (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            className={cn(
              "bg-background/20 backdrop-blur-sm",
              currentPage === page && "bg-primary/20 text-primary border-primary/50",
            )}
            asChild={currentPage !== page}
          >
            {currentPage !== page ? <Link href={`${baseUrl}?page=${page}`}>{page}</Link> : <span>{page}</span>}
          </Button>
        )
      })}

      <Button
        variant="outline"
        size="icon"
        className={cn(
          "bg-background/20 backdrop-blur-sm",
          currentPage === totalPages && "opacity-50 cursor-not-allowed",
        )}
        disabled={currentPage === totalPages}
        asChild={currentPage !== totalPages}
      >        {currentPage !== totalPages ? (
          <Link href={`${baseUrl}?page=${currentPage + 1}`}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Pagina successiva</span>
          </Link>
        ) : (
          <span>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Pagina successiva</span>
          </span>
        )}
      </Button>
    </div>
  )
}
