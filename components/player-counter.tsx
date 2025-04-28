"use client"

import { useState, useEffect } from "react"
import { Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface PlayerCounterProps {
  className?: string
  height?: string
}

export function PlayerCounter({ className, height }: PlayerCounterProps) {
  const [count, setCount] = useState(0)
  const [targetCount, setTargetCount] = useState(0)
  const [isIncreasing, setIsIncreasing] = useState(true)

  // Simulate fluctuating player count
  useEffect(() => {
    const interval = setInterval(() => {
      const newTarget = Math.floor(Math.random() * 30) + 50
      setTargetCount(newTarget)
      setIsIncreasing(newTarget > count)
    }, 10000)

    return () => clearInterval(interval)
  }, [count])

  // Animate count to target
  useEffect(() => {
    if (count === targetCount) return

    const timeout = setTimeout(() => {
      setCount((current) => {
        if (current < targetCount) return current + 1
        if (current > targetCount) return current - 1
        return current
      })
    }, 100)

    return () => clearTimeout(timeout)
  }, [count, targetCount])

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full bg-background/20 backdrop-blur-sm border border-border/30",
        className,
      )}
      style={height ? { height } : undefined}
    >
      <Users className="h-5 w-5 text-primary" />
      <div className="flex items-center">
        <span className="font-bold text-lg">{count}</span>
        <span className="text-sm text-muted-foreground ml-1">players online</span>
        <span className={cn("ml-2 text-xs", isIncreasing ? "text-green-500" : "text-red-500")}>
          {isIncreasing ? "↑" : "↓"}
        </span>
      </div>
    </div>
  )
}
