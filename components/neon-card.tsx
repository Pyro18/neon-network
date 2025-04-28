import { type HTMLAttributes, forwardRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const neonCardVariants = cva(
  "rounded-lg border bg-background/20 backdrop-blur-sm text-card-foreground shadow-sm relative overflow-hidden group",
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

export interface NeonCardProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof neonCardVariants> {}

const NeonCard = forwardRef<HTMLDivElement, NeonCardProps>(({ className, variant, ...props }, ref) => {
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
    <div ref={ref} className={cn(neonCardVariants({ variant, className }))} {...props}>
      {props.children}
      <span
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
        style={{
          boxShadow: `inset 0 0 20px ${getGlowColor()}`,
          background: `radial-gradient(circle, ${getGlowColor()}10 0%, transparent 70%)`,
        }}
      />
    </div>
  )
})

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
