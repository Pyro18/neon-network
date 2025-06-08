/**
 * Pagina di accesso (login)
 * 
 * Layout:
 * - Form di accesso centralizzato
 * - Background con particelle neon
 * - Link per registrazione e recupero password
 * - Supporto login con OAuth providers
 * - Reindirizzamento post-login
 */

import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"
import { NeonParticles } from "@/components/neon-particles"

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
      <NeonParticles density={30} zIndex={-1} />

      <div className="w-full max-w-md z-10">        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Bentornato</h1>
          <p className="text-muted-foreground">Accedi al tuo account NeonNetwork</p>
        </div>

        <LoginForm />

        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">
            Non hai un account?{" "}
            <Link href="/auth/register" className="text-primary hover:text-primary/80 underline underline-offset-4">
              Registrati
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}