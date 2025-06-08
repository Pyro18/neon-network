"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface ThemeContextProps {
  theme: "light" | "dark"
  setTheme: (theme: "light" | "dark") => void
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: "dark",
  setTheme: () => {},
})

interface ThemeProviderProps {
  children: ReactNode
  attribute?: string
  defaultTheme?: "system" | "light" | "dark"
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null

    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"

    let initialTheme: "light" | "dark"

    if (storedTheme) {
      initialTheme = storedTheme
    } else if (enableSystem) {
      initialTheme = systemTheme
    } else {
      initialTheme = defaultTheme === "system" ? systemTheme : defaultTheme
    }

    setTheme(initialTheme)

    if (attribute === "class") {
      document.documentElement.classList.remove("light", "dark")
      document.documentElement.classList.add(initialTheme)
    } else {
      document.documentElement.setAttribute("data-theme", initialTheme)
    }
  }, [mounted, attribute, defaultTheme, enableSystem])

  useEffect(() => {
    if (!mounted) return

    localStorage.setItem("theme", theme)

    if (attribute === "class") {
      document.documentElement.classList.remove("light", "dark")
      document.documentElement.classList.add(theme)
    } else {
      document.documentElement.setAttribute("data-theme", theme)
    }
  }, [theme, mounted, attribute])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
