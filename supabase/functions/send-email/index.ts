import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "https://esm.sh/resend@2.0.0"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
// Use a verified email address - Resend allows sending from onboarding@resend.dev for testing
// For production, verify your domain or use a verified email
const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev"

if (!RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY environment variable is required")
}

const resend = new Resend(RESEND_API_KEY)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }

  try {
    console.log("send-email function called")
    console.log("RESEND_API_KEY exists:", !!RESEND_API_KEY)
    console.log("FROM_EMAIL:", FROM_EMAIL)

    const { to, subject, html, from } = await req.json()

    console.log("Email request received:", { to, subject, hasHtml: !!html, from })

    if (!to || !subject || !html) {
      console.error("Missing required fields:", { to: !!to, subject: !!subject, html: !!html })
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, html" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      )
    }

    console.log("Sending email via Resend...")
    const { data, error } = await resend.emails.send({
      from: from || FROM_EMAIL,
      to,
      subject,
      html,
    })

    if (error) {
      console.error("Resend error:", error)
      return new Response(
        JSON.stringify({ error: error.message || "Failed to send email", details: error }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      )
    }

    console.log("Email sent successfully:", data)
    return new Response(
      JSON.stringify({ success: true, data }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    )
  } catch (error: any) {
    console.error("Function error:", error)
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error", stack: error.stack }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    )
  }
})
