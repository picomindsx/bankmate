"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Facebook,
  CheckCircle,
  AlertCircle,
  Settings,
  Users,
  TrendingUp,
  ExternalLink,
  Copy,
  RefreshCw,
  Plus,
  Trash2,
  BarChart3,
} from "lucide-react"

interface FacebookConfig {
  appId: string
  appSecret: string
  accessToken: string
  pageId: string
  webhookUrl: string
  isConnected: boolean
  lastSync: string | null
}

interface LeadAssignmentRule {
  id: string
  name: string
  condition: string
  assignTo: string
  priority: number
  active: boolean
}

interface FacebookLead {
  id: string
  name: string
  email: string
  phone: string
  adName: string
  formName: string
  createdAt: string
  status: "new" | "assigned" | "processed"
  assignedTo?: string
}

export function FacebookIntegration() {
  const [config, setConfig] = useState<FacebookConfig>({
    appId: "",
    appSecret: "",
    accessToken: "",
    pageId: "",
    webhookUrl: `${typeof window !== "undefined" ? window.location.origin : ""}/api/facebook/webhook`,
    isConnected: false,
    lastSync: null,
  })

  const [assignmentRules, setAssignmentRules] = useState<LeadAssignmentRule[]>([])
  const [newRule, setNewRule] = useState({
    name: "",
    condition: "",
    assignTo: "",
    priority: 1,
  })
  const [editingRule, setEditingRule] = useState<string | null>(null)

  const [recentLeads, setRecentLeads] = useState<FacebookLead[]>([])

  const [isConnecting, setIsConnecting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  // Load saved configuration on component mount
  useEffect(() => {
    const savedConfig = localStorage.getItem("facebook-config")
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig))
    }

    const savedRules = localStorage.getItem("facebook-assignment-rules")
    if (savedRules) {
      setAssignmentRules(JSON.parse(savedRules))
    }
  }, [])

  // Save configuration to localStorage
  const saveConfig = (newConfig: FacebookConfig) => {
    localStorage.setItem("facebook-config", JSON.stringify(newConfig))
    setConfig(newConfig)
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    setConnectionStatus("idle")
    setErrorMessage("")

    try {
      if (!config.appId || !config.appSecret) {
        throw new Error("App ID and App Secret are required")
      }

      const response = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${config.accessToken}`)

      if (!response.ok) {
        throw new Error("Invalid access token or Facebook API error")
      }

      const userData = await response.json()

      const newConfig = {
        ...config,
        isConnected: true,
        lastSync: new Date().toISOString(),
      }

      saveConfig(newConfig)
      setConnectionStatus("success")
    } catch (error) {
      setConnectionStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Connection failed")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    const newConfig = {
      ...config,
      isConnected: false,
      accessToken: "",
      lastSync: null,
    }
    saveConfig(newConfig)
    setConnectionStatus("idle")
    setRecentLeads([]) // Clear leads when disconnecting
  }

  const handleSync = async () => {
    if (!config.isConnected || !config.accessToken) return

    setIsSyncing(true)
    try {
      const response = await fetch("/api/facebook/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessToken: config.accessToken,
          pageId: config.pageId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setRecentLeads(data.leads || [])

        const newConfig = {
          ...config,
          lastSync: new Date().toISOString(),
        }
        saveConfig(newConfig)
      }
    } catch (error) {
      console.error("Sync failed:", error)
      setErrorMessage("Failed to sync leads from Facebook")
    } finally {
      setIsSyncing(false)
    }
  }

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(config.webhookUrl)
  }

  const addAssignmentRule = () => {
    if (!newRule.name || !newRule.condition || !newRule.assignTo) return

    const rule: LeadAssignmentRule = {
      id: Date.now().toString(),
      ...newRule,
      active: true,
    }

    const updatedRules = [...assignmentRules, rule]
    setAssignmentRules(updatedRules)
    localStorage.setItem("facebook-assignment-rules", JSON.stringify(updatedRules))

    setNewRule({ name: "", condition: "", assignTo: "", priority: 1 })
  }

  const deleteAssignmentRule = (id: string) => {
    const updatedRules = assignmentRules.filter((rule) => rule.id !== id)
    setAssignmentRules(updatedRules)
    localStorage.setItem("facebook-assignment-rules", JSON.stringify(updatedRules))
  }

  const toggleRuleActive = (id: string) => {
    const updatedRules = assignmentRules.map((rule) => (rule.id === id ? { ...rule, active: !rule.active } : rule))
    setAssignmentRules(updatedRules)
    localStorage.setItem("facebook-assignment-rules", JSON.stringify(updatedRules))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-500"
      case "assigned":
        return "bg-orange-500"
      case "processed":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Facebook className="h-5 w-5 text-blue-600" />
              Facebook Integration Status
            </div>
            <Badge className={config.isConnected ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
              {config.isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {config.isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Successfully connected to Facebook Lead Ads</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Page ID:</span>
                  <div className="text-muted-foreground">{config.pageId || "Auto-detected"}</div>
                </div>
                <div>
                  <span className="font-medium">Last Sync:</span>
                  <div className="text-muted-foreground">
                    {config.lastSync ? new Date(config.lastSync).toLocaleString() : "Never"}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <div className="text-green-600">Active</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSync} size="sm" variant="outline" disabled={isSyncing}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                  {isSyncing ? "Syncing..." : "Sync Now"}
                </Button>
                <Button onClick={handleDisconnect} size="sm" variant="destructive">
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Facebook className="h-16 w-16 mx-auto text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Connect to Facebook</h3>
              <p className="text-muted-foreground mb-4">
                Connect your Facebook Business account to automatically import leads from Facebook Lead Ads
              </p>
              <Button onClick={handleConnect} disabled={isConnecting} className="bg-blue-600 hover:bg-blue-700">
                <Facebook className="mr-2 h-4 w-4" />
                {isConnecting ? "Connecting..." : "Connect Facebook Account"}
              </Button>
            </div>
          )}

          {connectionStatus === "success" && (
            <Alert className="mt-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Successfully connected to Facebook! Leads will now be automatically imported.
              </AlertDescription>
            </Alert>
          )}

          {connectionStatus === "error" && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="rules">Assignment Rules</TabsTrigger>
          <TabsTrigger value="leads">Recent Leads</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Facebook App Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appId">Facebook App ID</Label>
                  <Input
                    id="appId"
                    value={config.appId}
                    onChange={(e) => setConfig((prev) => ({ ...prev, appId: e.target.value }))}
                    placeholder="Enter your Facebook App ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appSecret">App Secret</Label>
                  <Input
                    id="appSecret"
                    type="password"
                    value={config.appSecret}
                    onChange={(e) => setConfig((prev) => ({ ...prev, appSecret: e.target.value }))}
                    placeholder="Enter your App Secret"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessToken">Access Token</Label>
                <Input
                  id="accessToken"
                  type="password"
                  value={config.accessToken}
                  onChange={(e) => setConfig((prev) => ({ ...prev, accessToken: e.target.value }))}
                  placeholder="Enter your Facebook Access Token"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pageId">Facebook Page ID (Optional)</Label>
                <Input
                  id="pageId"
                  value={config.pageId}
                  onChange={(e) => setConfig((prev) => ({ ...prev, pageId: e.target.value }))}
                  placeholder="Leave blank for auto-detection"
                />
              </div>

              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <div className="flex gap-2">
                  <Input value={config.webhookUrl} readOnly className="bg-gray-50" />
                  <Button onClick={copyWebhookUrl} size="sm" variant="outline">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">Use this URL in your Facebook App webhook configuration</p>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">Setup Instructions:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Create a Facebook App in the Facebook Developers console</li>
                  <li>Add the "Webhooks" and "Lead Ads" products to your app</li>
                  <li>Configure the webhook URL above in your Facebook App</li>
                  <li>Subscribe to "leadgen" webhook events</li>
                  <li>Generate an access token with leads_retrieval permission</li>
                  <li>Enter your App ID, App Secret, and Access Token above and connect</li>
                </ol>
                <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Facebook Developers
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Lead Assignment Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignmentRules.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No assignment rules configured yet.</p>
                    <p className="text-sm">Add rules below to automatically assign leads to staff members.</p>
                  </div>
                ) : (
                  assignmentRules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{rule.name}</h4>
                          <Badge className={rule.active ? "bg-green-500 text-white" : "bg-gray-500 text-white"}>
                            {rule.active ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline">Priority {rule.priority}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          <strong>Condition:</strong> {rule.condition}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Assign to:</strong> {rule.assignTo}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => toggleRuleActive(rule.id)}>
                          {rule.active ? "Disable" : "Enable"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => deleteAssignmentRule(rule.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-4">Add New Assignment Rule</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Rule Name</Label>
                      <Input
                        value={newRule.name}
                        onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                        placeholder="e.g., Home Loan Leads"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Assign To</Label>
                      <Input
                        value={newRule.assignTo}
                        onChange={(e) => setNewRule({ ...newRule, assignTo: e.target.value })}
                        placeholder="Staff member name or role"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Condition</Label>
                      <Input
                        value={newRule.condition}
                        onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
                        placeholder="e.g., ad_name contains 'home loan' OR form_name contains 'personal loan'"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Input
                        type="number"
                        min="1"
                        value={newRule.priority}
                        onChange={(e) => setNewRule({ ...newRule, priority: Number.parseInt(e.target.value) || 1 })}
                      />
                    </div>
                  </div>
                  <Button onClick={addAssignmentRule} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Assignment Rule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Facebook Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentLeads.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No Facebook leads found.</p>
                  <p className="text-sm">
                    {config.isConnected
                      ? "Click 'Sync Now' to fetch recent leads from Facebook."
                      : "Connect your Facebook account to start importing leads."}
                  </p>
                  {config.isConnected && (
                    <Button onClick={handleSync} className="mt-4" disabled={isSyncing}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                      {isSyncing ? "Syncing..." : "Sync Now"}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentLeads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{lead.name}</h4>
                          <Badge className={`${getStatusColor(lead.status)} text-white`}>
                            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div>
                            <strong>Email:</strong> {lead.email}
                          </div>
                          <div>
                            <strong>Phone:</strong> {lead.phone}
                          </div>
                          <div>
                            <strong>Ad:</strong> {lead.adName}
                          </div>
                          <div>
                            <strong>Form:</strong> {lead.formName}
                          </div>
                          <div>
                            <strong>Received:</strong> {new Date(lead.createdAt).toLocaleString()}
                          </div>
                          {lead.assignedTo && (
                            <div>
                              <strong>Assigned to:</strong> {lead.assignedTo}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                        <Button size="sm">Convert to Lead</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
            <p>Connect Facebook and start importing leads to see detailed analytics.</p>
            <p className="text-sm mt-2">
              Analytics will show conversion rates, lead sources, campaign performance, and more.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
