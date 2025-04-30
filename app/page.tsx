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

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Welcome to{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-primary to-purple-500">
              NeonNetwork
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-8">
            Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien 
            vitae pellentesque sem placerat in.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <NeonButton size="lg">
              Join Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </NeonButton>
            <NeonButton variant="purple" size="lg">
              Watch Trailer
            </NeonButton>
          </div>

          <PlayerCounter className="mb-8" />
        </div>
      </section>

      {/* Server Map */}
      <section className="py-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Interactive Server Map</h2>
            <p className="text-muted-foreground mb-6">
              Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat 
              in id cursus mi pretium tellus duis convallis tempus leo.
            </p>
          </div>
          <div className="flex-1 h-[400px] w-full">
            <ServerMap />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Server Features</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NeonCard variant="blue">
            <NeonCardHeader>
              <NeonCardTitle>Community Forum</NeonCardTitle>
            </NeonCardHeader>
            <NeonCardContent>
              <p>Connect with other players, share your builds, and participate in community discussions.</p>
            </NeonCardContent>
            <NeonCardFooter>
              <Link href="/forum" className="text-blue-500 hover:text-blue-400 flex items-center">
                Visit Forum <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </NeonCardFooter>
          </NeonCard>

          <NeonCard variant="purple">
            <NeonCardHeader>
              <NeonCardTitle>Custom Game Modes</NeonCardTitle>
            </NeonCardHeader>
            <NeonCardContent>
              <p>Experience unique gameplay with our custom-developed game modes and plugins.</p>
            </NeonCardContent>
            <NeonCardFooter>
              <Link href="/documentation" className="text-purple-500 hover:text-purple-400 flex items-center">
                Learn More <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </NeonCardFooter>
          </NeonCard>

          <NeonCard variant="green">
            <NeonCardHeader>
              <NeonCardTitle>Active Staff Team</NeonCardTitle>
            </NeonCardHeader>
            <NeonCardContent>
              <p>Our dedicated staff team is always available to help with any issues or questions.</p>
            </NeonCardContent>
            <NeonCardFooter>
              <Link href="/support" className="text-green-500 hover:text-green-400 flex items-center">
                Get Support <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </NeonCardFooter>
          </NeonCard>
        </div>
      </section>

      {/* News Section */}
      <section className="py-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Latest News & Updates</h2>

        <NewsCarousel />
      </section>

      {/* Quick Links */}
      <section className="py-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/forum">
            <div className="p-6 rounded-lg border border-border/30 hover:border-primary/50 bg-background/20 backdrop-blur-sm transition-all group">
              <MessageSquare className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-medium mb-2">Community Forum</h3>
              <p className="text-sm text-muted-foreground">Join discussions and share your experiences</p>
              <div className="mt-4 text-primary flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                Visit <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </Link>

          <Link href="/documentation">
            <div className="p-6 rounded-lg border border-border/30 hover:border-primary/50 bg-background/20 backdrop-blur-sm transition-all group">
              <FileText className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-medium mb-2">Documentation</h3>
              <p className="text-sm text-muted-foreground">Learn about our server features and commands</p>
              <div className="mt-4 text-primary flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                Read <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </Link>

          <Link href="/map">
            <div className="p-6 rounded-lg border border-border/30 hover:border-primary/50 bg-background/20 backdrop-blur-sm transition-all group">
              <MapIcon className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-medium mb-2">Server Map</h3>
              <p className="text-sm text-muted-foreground">Explore our world with the interactive map</p>
              <div className="mt-4 text-primary flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                Explore <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </Link>

          <Link href="/community">
            <div className="p-6 rounded-lg border border-border/30 hover:border-primary/50 bg-background/20 backdrop-blur-sm transition-all group">
              <Users className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-medium mb-2">Community</h3>
              <p className="text-sm text-muted-foreground">Meet other players and join events</p>
              <div className="mt-4 text-primary flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                Join <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}
