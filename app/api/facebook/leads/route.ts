import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const leadId = searchParams.get("leadId")
  const accessToken = searchParams.get("accessToken")

  if (!leadId || !accessToken) {
    return NextResponse.json({ error: "Missing leadId or accessToken" }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${leadId}?fields=field_data,created_time,ad_id,form_id&access_token=${accessToken}`,
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Facebook API error: ${response.status} - ${errorData.error?.message || response.statusText}`)
    }

    const leadData = await response.json()

    // Transform Facebook lead data to our format
    const transformedLead = {
      id: leadData.id,
      createdAt: leadData.created_time,
      adId: leadData.ad_id,
      formId: leadData.form_id,
      fields: leadData.field_data.reduce((acc: any, field: any) => {
        acc[field.name] = field.values[0]
        return acc
      }, {}),
    }

    return NextResponse.json(transformedLead)
  } catch (error) {
    console.error("Error fetching Facebook lead:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch lead",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { accessToken, pageId } = await request.json()

    if (!accessToken) {
      return NextResponse.json({ error: "Missing accessToken" }, { status: 400 })
    }

    let url = `https://graph.facebook.com/v18.0/me/leadgen_forms?fields=leads{field_data,created_time,ad_id}&access_token=${accessToken}`

    if (pageId) {
      url = `https://graph.facebook.com/v18.0/${pageId}/leadgen_forms?fields=leads{field_data,created_time,ad_id}&access_token=${accessToken}`
    }

    const response = await fetch(url)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Facebook API error: ${response.status} - ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()

    // Transform the leads data
    const transformedLeads = []
    if (data.data) {
      for (const form of data.data) {
        if (form.leads && form.leads.data) {
          for (const lead of form.leads.data) {
            const fields = lead.field_data.reduce((acc: any, field: any) => {
              acc[field.name] = field.values[0]
              return acc
            }, {})

            transformedLeads.push({
              id: lead.id || Date.now().toString(),
              name: fields.full_name || fields.name || "Facebook Lead",
              email: fields.email || "lead@facebook.com",
              phone: fields.phone_number || "+91 0000000000",
              adName: `Ad ${lead.ad_id}`,
              formName: form.name || "Facebook Form",
              createdAt: lead.created_time || new Date().toISOString(),
              status: "new",
            })
          }
        }
      }
    }

    return NextResponse.json({ leads: transformedLeads })
  } catch (error) {
    console.error("Error syncing Facebook leads:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to sync leads",
      },
      { status: 500 },
    )
  }
}
