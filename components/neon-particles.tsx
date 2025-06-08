"use client"

/**
 * Componente di particelle animate in stile cyberpunk/neon
 * 
 * Funzionalità:
 * - Animazione canvas con particelle colorate
 * - Seguimento del cursore mouse (opzionale)
 * - Effetti di glow e dissolvenza
 * - Colori personalizzabili per il tema
 * - Densità configurabile per performance
 * - Z-index regolabile per layering
 */

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

/**
 * Struttura dati per una singola particella
 */
interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string
  alpha: number
  decay: number
}

/**
 * Props per il componente NeonParticles
 */
interface NeonParticlesProps {
  className?: string
  density?: number
  followMouse?: boolean
  colors?: string[]
  zIndex?: number
}

export function NeonParticles({
  className,
  density = 50,
  followMouse = true,
  colors = ["#0ef", "#f0e", "#0f0", "#ff0"],
  zIndex = -1,
}: NeonParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas to full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = []
      for (let i = 0; i < density; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.5 + 0.2,
          decay: 0.01 + Math.random() * 0.02,
        })
      }
    }

    initParticles()

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY

      // Add particles at mouse position
      if (followMouse) {
        for (let i = 0; i < 2; i++) {
          particlesRef.current.push({
            x: mouseRef.current.x,
            y: mouseRef.current.y,
            size: Math.random() * 3 + 2,
            speedX: (Math.random() - 0.5) * 2,
            speedY: (Math.random() - 0.5) * 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 0.8,
            decay: 0.02 + Math.random() * 0.03,
          })
        }
      }
    }

    window.addEventListener("mousemove", handleMouseMove)

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particlesRef.current.forEach((particle, index) => {
        // Update position
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Fade out
        particle.alpha -= particle.decay

        // Remove dead particles
        if (particle.alpha <= 0) {
          particlesRef.current.splice(index, 1)
          return
        }

        // Draw particle
        ctx.globalAlpha = particle.alpha
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.fill()

        // Add glow effect
        ctx.shadowBlur = 10
        ctx.shadowColor = particle.color
      })

      // Maintain particle count
      while (particlesRef.current.length < density) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.5 + 0.2,
          decay: 0.01 + Math.random() * 0.02,
        })
      }

      ctx.globalAlpha = 1
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas)
      window.removeEventListener("mousemove", handleMouseMove)
      cancelAnimationFrame(animationRef.current)
    }
  }, [density, followMouse, colors])

  return (
    <canvas 
      ref={canvasRef} 
      className={cn(
        "fixed inset-0 pointer-events-none",
        className
      )} 
      style={{ zIndex }}
    />
  )
}

/**
 * Codice delle particelle preso da un bro su GitHub, modificato per adattarsi al progetto.
 */