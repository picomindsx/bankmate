"use client"

import { useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Bell } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { TotalLeadsOverview } from "@/components/total-leads-overview"

export default function TotalLeadsPage() {
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user || user.type !== "official") {
      router.push("/")
      return
    }
  }, [user, router])

  if (!user || user.type !== "official") {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-2xl">
        <div className="flex h-20 items-center justify-between px-8">
          <div className="flex items-center gap-6">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="relative">
              <Image
                src="/images/bankmate-logo.png"
                alt="Bankmate Solutions Logo"
                width={50}
                height={50}
                className="rounded-xl shadow-lg"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Total Leads Overview
              </h1>
              <p className="text-blue-200/80 font-medium">Comprehensive lead analytics and management</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              className="relative backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20 text-white"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-white font-semibold block">{user.name}</span>
                <span className="text-blue-200/70 text-sm">Owner Access</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="backdrop-blur-sm bg-red-500/20 hover:bg-red-500/30 border-red-400/50 text-white hover:text-white"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8">
        <TotalLeadsOverview />
      </div>
    </div>
  )
}
