"use client"

/**
 * Componente form di login
 * 
 * Gestisce:
 * - Login con email e password
 * - Validazione form con Zod
 * - Toggle visibilità password
 * - Login con OAuth providers (Discord, Google, etc.)
 * - Gestione errori e stati di caricamento
 * - Link per registrazione e reset password
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { SocialLoginButtons } from "@/components/auth/social-login-buttons"
import { NeonCard } from "@/components/neon-card"
import { useAuth } from "@/hooks/use-auth"

// Schema di validazione per il form di login
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

/**
 * Componente form di login con validazione e gestione stati
 */
export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { signIn } = useAuth()

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true)
    
    try {
      const { error } = await signIn(values.email, values.password)
      
      if (error) {
        console.error("Login error:", error)
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password")
        } else {
          toast.error("Failed to sign in. Please try again.")
        }
        return
      }
      
      // Login avvenuto con successo
      toast.success("Login avvenuto con successo")
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Unexpected error during login:", error)
      toast.error("Si è verificato un errore imprevisto")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <NeonCard className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="your.email@example.com"
                    {...field}
                    disabled={isLoading}
                    className="bg-background/50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...field}
                      disabled={isLoading}
                      className="bg-background/50 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary hover:text-primary/80 underline underline-offset-4"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/30"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-2 text-muted-foreground">or continue with</span>
        </div>
      </div>

      <SocialLoginButtons isLoading={isLoading} />
    </NeonCard>
  )
}