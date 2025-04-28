import Link from "next/link"
import {
  MessageSquare,
  FileText,
  Map,
  Users,
  HelpCircle,
  Ticket,
  Github,
  DiscIcon as Discord,
  Twitter,
} from "lucide-react"
import { NeonLogo } from "@/components/neon-logo"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const mainLinks = [
    { href: "/", label: "Home", icon: null },
    { href: "/forum", label: "Forum", icon: MessageSquare },
    { href: "/documentation", label: "Documentation", icon: FileText },
    { href: "/map", label: "Server Map", icon: Map },
    { href: "/community", label: "Community", icon: Users },
    { href: "/support", label: "Support", icon: HelpCircle },
    { href: "/tickets", label: "Tickets", icon: Ticket },
  ]

  const legalLinks = [
    { href: "/terms", label: "Terms of Service" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/cookies", label: "Cookies Policy" },
    { href: "/data", label: "Data Processing" },
    { href: "/account", label: "Account Management" },
  ]

  const socialLinks = [
    { href: "https://discord.gg/neonnetwork", label: "Discord", icon: Discord },
    { href: "https://twitter.com/neonnetwork", label: "Twitter", icon: Twitter },
    { href: "https://github.com/neonnetwork", label: "GitHub", icon: Github },
  ]

  return (
    <footer className="border-t border-border/30 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo and description */}
          <div className="flex flex-col">
            <Link href="/" className="inline-block">
              <NeonLogo />
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              NeonNetwork is a vibrant Minecraft community with unique gameplay experiences, custom plugins, and an
              amazing player base.
            </p>
            <div className="mt-4 flex space-x-4">
              {socialLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.icon && <link.icon className="h-5 w-5" />}
                  <span className="sr-only">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Main links */}
          <div>
            <h3 className="text-lg font-medium mb-4">Navigation</h3>
            <ul className="space-y-2">
              {mainLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                  >
                    {link.icon && <link.icon className="h-4 w-4" />}
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h3 className="text-lg font-medium mb-4">Legal</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Server info */}
          <div>
            <h3 className="text-lg font-medium mb-4">Server Information</h3>
            <p className="text-sm text-muted-foreground mb-2">Join our Minecraft server at:</p>
            <p className="text-sm font-mono bg-background/50 p-2 rounded border border-border/30 mb-4">
              play.neonnetwork.mc
            </p>
            <p className="text-sm text-muted-foreground">Server version: 1.20.4</p>
            <p className="text-sm text-muted-foreground">Supported versions: 1.19 - 1.20.4</p>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">&copy; {currentYear} NeonNetwork. All rights reserved.</p>
          <p className="text-sm text-muted-foreground mt-2 md:mt-0">Not affiliated with Mojang Studios or Microsoft.</p>
        </div>
      </div>
    </footer>
  )
}
