/** * NeonLogo Component
  * Fatto usando un canvas, in futuro dovete adattarlo per il supporto di un SVG o quello che preferite.
 */

"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

export function NeonLogo({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = 180
    canvas.height = 40

    // Function to draw the neon text
    const drawNeonText = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Background glow
      ctx.shadowBlur = 15
      ctx.shadowColor = "#0ef"

      // Text settings
      ctx.font = "bold 24px 'Inter', sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      // First pass - outer glow
      ctx.fillStyle = "#0ef"
      ctx.shadowBlur = 15
      ctx.fillText("NeonNetwork", canvas.width / 2, canvas.height / 2)

      // Second pass - inner bright text
      ctx.shadowBlur = 5
      ctx.fillStyle = "#fff"
      ctx.fillText("NeonNetwork", canvas.width / 2, canvas.height / 2)

      // Pulsating effect
      const time = Date.now() / 1000
      const intensity = Math.sin(time * 2) * 0.1 + 0.9

      ctx.globalAlpha = intensity
      ctx.shadowBlur = 10 * intensity
      ctx.fillStyle = "#0ef"
      ctx.fillText("NeonNetwork", canvas.width / 2, canvas.height / 2)

      ctx.globalAlpha = 1
    }

    // Animation loop
    let animationId: number
    const animate = () => {
      drawNeonText()
      animationId = requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  return <canvas ref={canvasRef} className={cn("h-10 w-[180px]", className)} />
}
