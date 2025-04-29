"use client"

import Link from "next/link"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"

import { NeonParticles } from "@/components/neon-particles"
import { NeonCard } from "@/components/neon-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useAuth } from "@/hooks/use-auth"

const resetPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
})

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { resetPassword } = useAuth()

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
    setIsLoading(true)
    
    try {
      const { error } = await resetPassword(values.email)
      
      if (error) {
        console.error("Reset password error:", error)
        toast.error("Failed to send reset email. Please try again.")
        return
      }
      
      // Successfully sent reset email
      setIsSubmitted(true)
      toast.success("Reset password email sent")
    } catch (error) {
      console.error("Unexpected error during password reset:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
      <NeonParticles density={30} zIndex={-1} />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Reset Password</h1>
          <p className="text-muted-foreground">
            {isSubmitted 
              ? "Check your email for a reset link" 
              : "Enter your email to receive a password reset link"}
          </p>
        </div>

        <NeonCard className="p-6">
          {isSubmitted ? (
            <div className="text-center py-4">
              <p className="mb-6">
                We've sent a password reset link to your email. The link will expire in 24 hours.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                If you don't see the email, check your spam folder.
              </p>
              <Button onClick={() => setIsSubmitted(false)} className="mr-2">
                Try again
              </Button>
              <Link href="/auth/login">
                <Button variant="outline">Back to login</Button>
              </Link>
            </div>
          ) : (
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

                <div className="flex justify-between">
                  <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground">
                    Back to login
                  </Link>
                  <Button
                    type="submit"
                    className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send reset link"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </NeonCard>
      </div>
    </div>
  )
}