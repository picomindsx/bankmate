"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Bell, ArrowLeft, Key, Shield } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { FacebookIntegration } from "@/components/facebook-integration"
import StaffManagement from "@/components/staff-management"
import { hasPermission } from "@/lib/auth"

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (!user || user.type !== "official") {
      router.push("/")
      return
    }
  }, [user, router])

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle password change logic here
    alert("Password change functionality would be implemented here")
  }

  if (!user || user.type !== "official") {
    return <div>Loading...</div>
  }

  const canManageStaff = hasPermission(user, "staff.view") || hasPermission(user, "staff.create")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b bg-black/20 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Image
              src="/placeholder.svg?key=8z1ld"
              alt="Bankmate Solutions Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <div>
              <h1 className="text-xl font-semibold text-white">Settings</h1>
              <p className="text-sm text-gray-300">System configuration and access control</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="relative text-white hover:bg-white/10">
              <Bell className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">{user.name}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        <Tabs defaultValue={canManageStaff ? "staff" : "facebook"} className="w-full max-w-6xl mx-auto">
          <TabsList
            className={`grid w-full ${canManageStaff ? "grid-cols-4" : "grid-cols-3"} bg-white/10 backdrop-blur-xl`}
          >
            {canManageStaff && (
              <TabsTrigger value="staff" className="text-white data-[state=active]:bg-white/20">
                <Shield className="h-4 w-4 mr-2" />
                Staff & Access
              </TabsTrigger>
            )}
            <TabsTrigger value="facebook" className="text-white data-[state=active]:bg-white/20">
              Facebook Integration
            </TabsTrigger>
            <TabsTrigger value="password" className="text-white data-[state=active]:bg-white/20">
              Password
            </TabsTrigger>
            <TabsTrigger value="general" className="text-white data-[state=active]:bg-white/20">
              General
            </TabsTrigger>
          </TabsList>

          {canManageStaff && (
            <TabsContent value="staff" className="space-y-6">
              <StaffManagement currentUser={user} />
            </TabsContent>
          )}

          <TabsContent value="facebook" className="space-y-6">
            <FacebookIntegration />
          </TabsContent>

          <TabsContent value="password" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Key className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription className="text-gray-300">Update your login password for security</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-white">
                      Current Password
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-white">
                      New Password
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Settings className="h-5 w-5" />
                  General Settings
                </CardTitle>
                <CardDescription className="text-gray-300">System-wide configuration options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/5">
                    <div>
                      <h5 className="font-medium text-white">System Permissions</h5>
                      <p className="text-sm text-gray-300">Configure role-based access control</p>
                    </div>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                      <Shield className="mr-2 h-4 w-4" />
                      Configure
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/5">
                    <div>
                      <h5 className="font-medium text-white">Notification Preferences</h5>
                      <p className="text-sm text-gray-300">Set up system notifications and alerts</p>
                    </div>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                      <Bell className="mr-2 h-4 w-4" />
                      Configure
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/5">
                    <div>
                      <h5 className="font-medium text-white">System Backup</h5>
                      <p className="text-sm text-gray-300">Configure automatic data backups</p>
                    </div>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                      Setup Backup
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
