import type React from "react"
import type { Metadata } from "next"
import { Mona_Sans as FontSans } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AuthProvider } from "@/hooks/use-auth"
import { Toaster } from "@/components/ui/toaster"

// Configurazione del font principale dell'applicazione
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

// Metadati per SEO e informazioni della pagina
export const metadata: Metadata = {
  title: "NeonNetwork | Minecraft Server",
  description: "Join the Minecraft server NeonNetwork community"
}

/**
 * Layout principale dell'applicazione NeonNetwork
 * 
 * Questo componente definisce la struttura base di tutte le pagine:
 * - Configurazione dei providers (Auth e Theme)
 * - Header fisso con navigazione
 * - Area principale per il contenuto dinamico
 * - Footer con informazioni del server
 * - Sistema di notifiche (Toaster)
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased flex flex-col", fontSans.variable)}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}