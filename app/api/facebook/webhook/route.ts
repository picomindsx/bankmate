import { type NextRequest, NextResponse } from "next/server"
import { addLead } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get("hub.mode")
    const token = searchParams.get("hub.verify_token")
    const challenge = searchParams.get("hub.challenge")

    if (!mode || !token || !challenge) {
      return new NextResponse("Missing required parameters", { status: 400 })
    }

    if (mode === "subscribe" && token === process.env.FACEBOOK_VERIFY_TOKEN) {
      return new NextResponse(challenge)
    }

    return new NextResponse("Forbidden", { status: 403 })
  } catch (error) {
    console.error("Facebook webhook GET error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body || typeof body !== "object") {
      return new NextResponse("Invalid request body", { status: 400 })
    }

    // Process Facebook lead data
    if (body.object === "page" && Array.isArray(body.entry)) {
      for (const entry of body.entry) {
        if (!entry || !Array.isArray(entry.changes)) {
          continue
        }

        for (const change of entry.changes) {
          if (change?.field === "leadgen" && change?.value) {
            const { leadgen_id: leadgenId, ad_id: adId, form_id: formId, page_id: pageId } = change.value

            if (!leadgenId) {
              console.error("Missing leadgen_id in webhook data")
              continue
            }

            try {
              // Fetch lead details from Facebook Graph API
              const accessToken = process.env.FACEBOOK_ACCESS_TOKEN
              if (!accessToken) {
                console.error("Facebook access token not configured")
                continue
              }

              const leadResponse = await fetch(
                `https://graph.facebook.com/v18.0/${leadgenId}?fields=field_data,created_time,ad_id,form_id&access_token=${accessToken}`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                  },
                },
              )

              if (!leadResponse.ok) {
                const errorText = await leadResponse.text()
                console.error("Failed to fetch lead from Facebook:", leadResponse.status, errorText)
                continue
              }

              const leadData = await leadResponse.json()

              if (!leadData || !Array.isArray(leadData.field_data)) {
                console.error("Invalid lead data structure from Facebook API")
                continue
              }

              // Transform Facebook lead data to our format
              const fields = leadData.field_data.reduce((acc: Record<string, string>, field: any) => {
                if (field?.name && field?.values && Array.isArray(field.values) && field.values[0]) {
                  acc[field.name] = field.values[0]
                }
                return acc
              }, {})

              const newLeadData = {
                leadName: `FB-${leadgenId}`,
                clientName: fields.full_name || fields.name || "Facebook Lead",
                contactNumber: fields.phone_number || "+91 0000000000",
                email: fields.email || "lead@facebook.com",
                address: fields.address || "Address from Facebook",
                leadType: "Personal Loan", // Would be determined by assignment rules
                leadSource: "Facebook",
                cost: 0,
                cibilScore: 0,
                applicationStatus: "login" as const,
                additionalInfo: `Facebook Lead - Ad ID: ${adId || "N/A"}, Form ID: ${formId || "N/A"}`,
                branchId: "1", // Would be determined by assignment rules
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }

              // Create lead in system
              const newLead = addLead(newLeadData)
              if (newLead) {
                console.log("Successfully created lead from Facebook:", newLead.id)
              } else {
                console.error("Failed to create lead in system")
              }
            } catch (error) {
              console.error("Error processing Facebook lead:", error instanceof Error ? error.message : error)
            }
          }
        }
      }
    }

    return new NextResponse("OK", { status: 200 })
  } catch (error) {
    console.error("Facebook webhook error:", error instanceof Error ? error.message : error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
