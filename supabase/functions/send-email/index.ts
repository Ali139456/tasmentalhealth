import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "https://esm.sh/resend@2.0.0"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") || "Tasmanian Mental Health Directory <noreply@tasmentalhealthdirectory.com.au>"

if (!RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY environment variable is required")
}

const resend = new Resend(RESEND_API_KEY)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    })
  }

  try {
    const { to, subject, html, from } = await req.json()

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, html" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      )
    }

    const { data, error } = await resend.emails.send({
      from: from || FROM_EMAIL,
      to,
      subject,
      html,
    })

    if (error) {
      console.error("Resend error:", error)
      return new Response(
        JSON.stringify({ error: error.message || "Failed to send email" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    )
  } catch (error: any) {
    console.error("Function error:", error)
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    )
  }
})
