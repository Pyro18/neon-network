import { type HTMLAttributes, forwardRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const neonCardVariants = cva(
  "rounded-lg border bg-background/20 backdrop-blur-sm text-card-foreground shadow-sm relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "border-border/30 hover:border-primary/50",
        blue: "border-border/30 hover:border-blue-500/50",
        purple: "border-border/30 hover:border-purple-500/50",
        pink: "border-border/30 hover:border-pink-500/50",
        green: "border-border/30 hover:border-green-500/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface NeonCardProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof neonCardVariants> {
  disableGlow?: boolean;
}

const NeonCard = forwardRef<HTMLDivElement, NeonCardProps>(
  ({ className, variant, disableGlow = false, style, ...props }, ref) => {
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

    const glowStyle = !disableGlow
      ? {
          ...style,
          boxShadow: `inset 0 0 20px ${getGlowColor()}00`,
          background: `radial-gradient(circle, ${getGlowColor()}00 0%, transparent 70%)`,
          transition: "box-shadow 0.5s, background 0.5s",
        }
      : style;

    const hoverStyle = {
      "&:hover": {
        boxShadow: !disableGlow ? `inset 0 0 20px ${getGlowColor()}` : undefined,
        background: !disableGlow
          ? `radial-gradient(circle, ${getGlowColor()}10 0%, transparent 70%)`
          : undefined,
      },
    };

    return (
      <div
        ref={ref}
        className={cn(neonCardVariants({ variant, className }))}
        style={{
          ...glowStyle,
          ...hoverStyle,
        }}
        {...props}
      />
    )
  }
)

NeonCard.displayName = "NeonCard"

const NeonCardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
))
NeonCardHeader.displayName = "NeonCardHeader"

const NeonCardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
  ),
)
NeonCardTitle.displayName = "NeonCardTitle"

const NeonCardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
)
NeonCardDescription.displayName = "NeonCardDescription"

const NeonCardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
NeonCardContent.displayName = "NeonCardContent"

const NeonCardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
))
NeonCardFooter.displayName = "NeonCardFooter"

export { NeonCard, NeonCardHeader, NeonCardFooter, NeonCardTitle, NeonCardDescription, NeonCardContent }
