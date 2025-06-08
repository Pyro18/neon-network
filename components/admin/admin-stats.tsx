"use client"

/**
 * Componente statistiche pannello amministrativo
 * 
 * Metriche visualizzate:
 * - Utenti attivi online
 * - Nuovi thread creati oggi
 * - Contenuti segnalati da moderare
 * - Approvazioni in attesa
 * - Aggiornamento automatico ogni 30s
 * - Layout responsive con icone colorate
 */

import { useState, useEffect } from "react"
import { Users, MessageSquare, Flag, AlertTriangle } from "lucide-react"

export function AdminStats() {
  const [activeUsers, setActiveUsers] = useState(42)
  const [newThreads, setNewThreads] = useState(8)
  const [reportedContent, setReportedContent] = useState(0)
  const [pendingApprovals, setPendingApprovals] = useState(3)
  // Simula fluctuazioni realistiche delle statistiche admin
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(Math.floor(Math.random() * 20) + 35)
      setNewThreads(Math.floor(Math.random() * 5) + 5)
      setReportedContent(Math.floor(Math.random() * 2))
      setPendingApprovals(Math.floor(Math.random() * 4) + 1)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
        </div>
        <div>          <p className="text-sm text-muted-foreground">Nuovi Thread</p>
          <p className="text-xl font-semibold">{newThreads} oggi</p>
        </div>
      </div>

      <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-border/30 p-4 flex items-center">
        <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center mr-4">
          <Flag className="h-5 w-5 text-amber-500" />
        </div>
        <div>          <p className="text-sm text-muted-foreground">Contenuti Segnalati</p>
          <p className="text-xl font-semibold">{reportedContent} in attesa</p>
        </div>
      </div>

      <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-border/30 p-4 flex items-center">
        <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center mr-4">
          <AlertTriangle className="h-5 w-5 text-purple-500" />
        </div>
        <div>          <p className="text-sm text-muted-foreground">Approvazioni in Attesa</p>
          <p className="text-xl font-semibold">{pendingApprovals} post</p>
        </div>
      </div>
    </div>
  )
}
