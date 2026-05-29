"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light")
  const [mounted, setMounted] = useState(false)

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as Theme) || "light"
    setTheme(savedTheme)
    setMounted(true)
  }, [])

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return
    const html = document.documentElement
    if (theme === "dark") {
      html.classList.add("dark")
    } else {
      html.classList.remove("dark")
    }
    localStorage.setItem("theme", theme)
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}
