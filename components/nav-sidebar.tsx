"use client"

import { MessageCircle, ImageIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function NavSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <div className="flex flex-col items-center gap-6 w-20 h-screen border-r border-border bg-card py-6">
      <Link
        href="/"
        className={cn(
          "flex flex-col items-center justify-center gap-2 w-14 h-14 rounded-lg transition-colors hover:bg-muted",
          isActive("/") && "bg-primary text-primary-foreground hover:bg-primary/90",
        )}
      >
        <MessageCircle className="h-6 w-6" />
        <span className="text-xs font-medium">Chat</span>
      </Link>

      <Link
        href="/image"
        className={cn(
          "flex flex-col items-center justify-center gap-2 w-14 h-14 rounded-lg transition-colors hover:bg-muted",
          isActive("/image") && "bg-primary text-primary-foreground hover:bg-primary/90",
        )}
      >
        <ImageIcon className="h-6 w-6" />
        <span className="text-xs font-medium">Image</span>
      </Link>
    </div>
  )
}
