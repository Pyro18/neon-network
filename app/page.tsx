/**
 * Homepage del server Minecraft NeonNetwork
 * 
 * Sezioni principali:
 * - Hero con titolo e CTA di connessione
 * - Statistiche giocatori online in tempo reale
 * - Mappa del server interattiva
 * - Carousel notizie e aggiornamenti
 * - Collegamenti rapidi (forum, guide, community)
 * - Effetti particelle neon per il tema cyberpunk
 */

import Link from "next/link"
import { ArrowRight, ChevronRight, Users, MapIcon, MessageSquare, FileText } from "lucide-react"
import { NeonParticles } from "@/components/neon-particles"
import { PlayerCounter } from "@/components/player-counter"
import { NeonButton } from "@/components/neon-button"
import { NeonCard, NeonCardContent, NeonCardFooter, NeonCardHeader, NeonCardTitle } from "@/components/neon-card"
import { ServerMap } from "@/components/server-map"
import { NewsCarousel } from "@/components/news-carousel"

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <NeonParticles />

      {/* Sezione Hero */}
      <section className="relative pt-20 pb-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Benvenuti su{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-primary to-purple-500">
              NeonNetwork
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-8">
            Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
            Ut enim ad minim veniam quis nostrud exercitation.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <NeonButton size="lg">
              Lorem Ipsum
              <ArrowRight className="ml-2 h-4 w-4" />
            </NeonButton>
            <NeonButton variant="purple" size="lg">
              Dolor Sit Amet
            </NeonButton>
          </div>

          <PlayerCounter className="mb-8" />
        </div>
      </section>

      {/* Server Map */}
      <section className="py-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Lorem Ipsum Dolor Sit</h2>
            <p className="text-muted-foreground mb-6">
              Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
              Ut enim ad minim veniam quis nostrud exercitation ullamco laboris.
            </p>
          </div>
          <div className="flex-1 h-[400px] w-full">
            <ServerMap />
          </div>
        </div>
      </section>

      {/* Sezione Caratteristiche */}
      <section className="py-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Lorem Ipsum Consectetur</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NeonCard variant="blue">
            <NeonCardHeader>
              <NeonCardTitle>Lorem Ipsum</NeonCardTitle>
            </NeonCardHeader>
            <NeonCardContent>
              <p>Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            </NeonCardContent>
            <NeonCardFooter>
              <Link href="/forum" className="text-blue-500 hover:text-blue-400 flex items-center">
                Ut Enim <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </NeonCardFooter>
          </NeonCard>

          <NeonCard variant="purple">
            <NeonCardHeader>
              <NeonCardTitle>Dolor Sit Amet</NeonCardTitle>
            </NeonCardHeader>
            <NeonCardContent>
              <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam.</p>
            </NeonCardContent>
            <NeonCardFooter>
              <Link href="/documentation" className="text-purple-500 hover:text-purple-400 flex items-center">
                Quis Nostrud <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </NeonCardFooter>
          </NeonCard>

          <NeonCard variant="green">
            <NeonCardHeader>
              <NeonCardTitle>Consectetur Adipiscing</NeonCardTitle>
            </NeonCardHeader>
            <NeonCardContent>
              <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque.</p>
            </NeonCardContent>
            <NeonCardFooter>
              <Link href="/support" className="text-green-500 hover:text-green-400 flex items-center">
                Exercitation <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </NeonCardFooter>
          </NeonCard>
        </div>
      </section>

      {/* News Section */}
      <section className="py-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Sed Do Eiusmod Tempor</h2>

        <NewsCarousel />
      </section>

      {/* Quick Links */}
      <section className="py-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/forum">
            <div className="p-6 rounded-lg border border-border/30 hover:border-primary/50 bg-background/20 backdrop-blur-sm transition-all group">
              <MessageSquare className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-medium mb-2">Lorem Ipsum</h3>
              <p className="text-sm text-muted-foreground">Lorem ipsum dolor sit amet consectetur adipiscing elit</p>
              <div className="mt-4 text-primary flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                Ut Enim <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </Link>

          <Link href="/documentation">
            <div className="p-6 rounded-lg border border-border/30 hover:border-primary/50 bg-background/20 backdrop-blur-sm transition-all group">
              <FileText className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-medium mb-2">Dolor Sit</h3>
              <p className="text-sm text-muted-foreground">Sed do eiusmod tempor incididunt ut labore et dolore</p>
              <div className="mt-4 text-primary flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                Magna <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </Link>

          <Link href="/map">
            <div className="p-6 rounded-lg border border-border/30 hover:border-primary/50 bg-background/20 backdrop-blur-sm transition-all group">
              <MapIcon className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-medium mb-2">Consectetur</h3>
              <p className="text-sm text-muted-foreground">Adipiscing elit sed do eiusmod tempor incididunt</p>
              <div className="mt-4 text-primary flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                Aliqua <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </Link>

          <Link href="/community">
            <div className="p-6 rounded-lg border border-border/30 hover:border-primary/50 bg-background/20 backdrop-blur-sm transition-all group">
              <Users className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-medium mb-2">Exercitation</h3>
              <p className="text-sm text-muted-foreground">Ullamco laboris nisi ut aliquip ex ea commodo</p>
              <div className="mt-4 text-primary flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                Consequat <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}
