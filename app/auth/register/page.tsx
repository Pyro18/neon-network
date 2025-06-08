/**
 * Pagina di registrazione
 * 
 * Layout:
 * - Form di registrazione centralizzato
 * - Background con particelle neon
 * - Link per login esistente
 * - Validazione avanzata campi
 * - Invio email di verifica
 */

import Link from "next/link"
import { RegisterForm } from "@/components/auth/register-form"
import { NeonParticles } from "@/components/neon-particles"

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
      <NeonParticles density={30} zIndex={-1} />

      <div className="w-full max-w-md z-10">        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Crea Account</h1>
          <p className="text-muted-foreground">Unisciti alla community NeonNetwork</p>
        </div>

        <RegisterForm />

        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">
            Hai già un account?{" "}
            <Link href="/auth/login" className="text-primary hover:text-primary/80 underline underline-offset-4">
              Accedi
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}