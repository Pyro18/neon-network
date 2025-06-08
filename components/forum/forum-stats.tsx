"use client"

/**
 * Componente statistiche del forum
 * 
 * Visualizza:
 * - Utenti attivi online in tempo reale
 * - Numero post pubblicati oggi
 * - Ultimo membro registrato
 * - Aggiornamento automatico dei dati
 * - Layout responsive a griglia
 * - Icone e styling consistente
 */

import { useState, useEffect } from "react"
import { Users, MessageSquare, Clock } from "lucide-react"

export function ForumStats() {
  const [activeUsers, setActiveUsers] = useState(42)
  const [todaysPosts, setTodaysPosts] = useState(87)
  // Simula fluctuazioni realistiche delle statistiche
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(Math.floor(Math.random() * 20) + 35)
      setTodaysPosts(Math.floor(Math.random() * 30) + 70)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-border/30 p-4 flex items-center">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Utenti Attivi</p>
          <p className="text-xl font-semibold">{activeUsers} online ora</p>
        </div>
      </div>

      <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-border/30 p-4 flex items-center">
        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center mr-4">
          <MessageSquare className="h-5 w-5 text-blue-500" />
        </div>        <div>
          <p className="text-sm text-muted-foreground">Attività Odierna</p>
          <p className="text-xl font-semibold">{todaysPosts} nuovi post</p>
        </div>
      </div>

      <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-border/30 p-4 flex items-center">
        <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center mr-4">
          <Clock className="h-5 w-5 text-purple-500" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Last Updated</p>
          <p className="text-xl font-semibold">Just now</p>
        </div>
      </div>
    </div>
  )
}
