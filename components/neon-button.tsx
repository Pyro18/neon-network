"use client"

/**
 * Componente Button con effetti neon/cyberpunk
 * 
 * Caratteristiche:
 * - Bordi luminosi e effetti glow
 * - Varianti di colore (blue, purple, pink, green)
 * - Background trasparente con blur
 * - Animazioni hover e focus
 * - Supporto per icone e diversi dimensioni
 * - Accessibilità completa
 */

import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Varianti di stile per il NeonButton usando class-variance-authority
 */
const neonButtonVariants = cva(
  "relative inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-background/20 backdrop-blur-sm border border-primary/50 text-primary hover:bg-primary/20",
        blue: "bg-background/20 backdrop-blur-sm border border-blue-500/50 text-blue-500 hover:bg-blue-500/20",
        purple: "bg-background/20 backdrop-blur-sm border border-purple-500/50 text-purple-500 hover:bg-purple-500/20",
        pink: "bg-background/20 backdrop-blur-sm border border-pink-500/50 text-pink-500 hover:bg-pink-500/20",
        green: "bg-background/20 backdrop-blur-sm border border-green-500/50 text-green-500 hover:bg-green-500/20",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface NeonButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof neonButtonVariants> {}

const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(({ className, variant, size, ...props }, ref) => {
  const getGlowColor = () => {
    switch (variant) {
      case "blue":
        return "#3b82f6"
      case "purple":
        return "#8b5cf6"
      case "pink":
        return "#ec4899"
      case "green":
        return "#10b981"
      default:
        return "#0ef"
    }
  }

  return (
    <button className={cn(neonButtonVariants({ variant, size, className }))} ref={ref} {...props}>
      {props.children}
      <span
        className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"
        style={{
          boxShadow: `0 0 15px ${getGlowColor()}, 0 0 30px ${getGlowColor()}`,
          background: `radial-gradient(circle, ${getGlowColor()}20 0%, transparent 70%)`,
        }}
      />
    </button>
  )
})

NeonButton.displayName = "NeonButton"

export { NeonButton, neonButtonVariants }
