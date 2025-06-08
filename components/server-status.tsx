"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface ServerStatusProps {
  className?: string
  compact?: boolean
}

export function ServerStatus({ className, compact = false }: ServerStatusProps) {
  const [playersOnline, setPlayersOnline] = useState(0)
  const [maxPlayers, setMaxPlayers] = useState(100)
  const [isOnline, setIsOnline] = useState(true)
  const [pingMs, setPingMs] = useState(0)

  // Simula lo stato del server e il conteggio dei giocatori
  useEffect(() => {
    const interval = setInterval(() => {
      // Simula fluttuazioni nel conteggio dei giocatori
      setPlayersOnline(Math.floor(Math.random() * 30) + 50)
      setPingMs(Math.floor(Math.random() * 20) + 10)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Badge
          variant={isOnline ? "default" : "destructive"}
          className={cn(
            "px-2 py-0 h-5 text-xs font-medium",
            isOnline && "bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 hover:text-emerald-500",
          )}
        >
          {isOnline ? "ONLINE" : "OFFLINE"}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {playersOnline}/{maxPlayers} players
        </span>
      </div>
    )
  }

  return (
    <div className={cn("p-3 rounded-lg bg-background/20 backdrop-blur-sm border border-border/30", className)}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Server Status</h3>
        <Badge
          variant={isOnline ? "default" : "destructive"}
          className={cn(
            "px-2 py-0 h-5 text-xs font-medium",
            isOnline && "bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 hover:text-emerald-500",
          )}
        >
          {isOnline ? "ONLINE" : "OFFLINE"}
        </Badge>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Players</span>
            <span className="text-xs font-medium">
              {playersOnline}/{maxPlayers}
            </span>
          </div>
          <Progress value={(playersOnline / maxPlayers) * 100} className="h-1.5 bg-background" />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Ping</span>
          <span className="text-xs font-medium">{pingMs}ms</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">IP Address</span>
          <span className="text-xs font-medium">mc.neonnetwork.it</span>
        </div>
      </div>
    </div>
  )
}
