"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NeonCard, NeonCardContent, NeonCardHeader, NeonCardTitle } from "@/components/neon-card"
import { cn } from "@/lib/utils"


/*
  Componenti per il carosello di notizie.
  Utilizza un array di oggetti per rappresentare le notizie, con proprietà come id, titolo, data, contenuto, immagine e variante di colore.
  Il carosello permette di navigare tra le notizie con animazioni fluide e include indicatori per la posizione corrente.

  PS: per ora sono stati utilizzati dei placeholder per le immagini e i contenuti.
  Nel sito finale, questi dati verrebbero probabilmente recuperati da un'API o da un database.
*/

const newsItems = [
  {
    id: 1,
    title: "Lorem Ipsum Dolor Sit Amet",
    date: "15 Marzo 2024",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.",
    image: "/placeholder.svg?height=200&width=400",
    variant: "blue",
  },
  {
    id: 2,
    title: "Consectetur Adipiscing Elit",
    date: "28 Febbraio 2024",
    content:
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis.",
    image: "/placeholder.svg?height=200&width=400",
    variant: "purple",
  },
  {
    id: 3,
    title: "Ut Labore Et Dolore Magna",
    date: "14 Febbraio 2024",
    content:
      "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias.",
    image: "/placeholder.svg?height=200&width=400",
    variant: "green",
  },
  {
    id: 4,
    title: "Excepturi Sint Occaecati",
    date: "5 Febbraio 2024",
    content:
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
    image: "/placeholder.svg?height=200&width=400",
    variant: "pink",
  },
]

export function NewsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)

  const goToNext = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setActiveIndex((prev) => (prev === newsItems.length - 1 ? 0 : prev + 1))
    setTimeout(() => setIsAnimating(false), 500)
  }

  const goToPrev = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setActiveIndex((prev) => (prev === 0 ? newsItems.length - 1 : prev - 1))
    setTimeout(() => setIsAnimating(false), 500)
  }

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(goToNext, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative">
      <div ref={carouselRef} className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {newsItems.map((item) => (
            <div key={item.id} className="w-full flex-shrink-0 px-4">
              <NeonCard variant={item.variant as any} className="overflow-hidden">
                <div className="relative h-48 w-full">
                  <img src={item.image || "/placeholder.svg"} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="text-xs text-muted-foreground">{item.date}</span>
                  </div>
                </div>
                <NeonCardHeader>
                  <NeonCardTitle>{item.title}</NeonCardTitle>
                </NeonCardHeader>
                <NeonCardContent>
                  <p>{item.content}</p>
                </NeonCardContent>
              </NeonCard>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/50 backdrop-blur-sm"
        onClick={goToPrev}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/50 backdrop-blur-sm"
        onClick={goToNext}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {newsItems.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              activeIndex === index ? "bg-primary w-4" : "bg-muted-foreground/30 hover:bg-muted-foreground/50",
            )}
            onClick={() => {
              setIsAnimating(true)
              setActiveIndex(index)
              setTimeout(() => setIsAnimating(false), 500)
            }}
          />
        ))}
      </div>
    </div>
  )
}
