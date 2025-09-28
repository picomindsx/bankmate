"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface BackButtonProps {
  href?: string
  label?: string
  variant?: "ghost" | "outline" | "default"
  size?: "sm" | "default" | "lg"
  className?: string
}

export function BackButton({ href, label = "Back", variant = "ghost", size = "sm", className }: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  if (href) {
    return (
      <Link href={href}>
        <Button variant={variant} size={size} className={className}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {label}
        </Button>
      </Link>
    )
  }

  return (
    <Button variant={variant} size={size} onClick={handleBack} className={className}>
      <ArrowLeft className="h-4 w-4 mr-2" />
      {label}
    </Button>
  )
}
