import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@2.0.0'

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") || "Tasmanian Mental Health Directory <noreply@tasmentalhealthdirectory.com.au>"
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const APP_URL = Deno.env.get("APP_URL") || "https://tasmentalhealthdirectory.com.au"

if (!RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY environment variable is required")
}

const resend = new Resend(RESEND_API_KEY)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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
    console.log("password-reset function called")
    const { email, redirectUrl } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Generate password reset token using Supabase Admin API
    // Always use production URL, never localhost
    const finalRedirectUrl = redirectUrl || `${APP_URL}/reset-password`
    
    // Ensure we never use localhost
    const safeRedirectUrl = finalRedirectUrl.includes('localhost') 
      ? `${APP_URL}/reset-password`
      : finalRedirectUrl
    
    console.log("Generating reset link with redirect URL:", safeRedirectUrl)
    
    const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: safeRedirectUrl,
      }
    })

    if (resetError) {
      console.error("Error generating reset link:", resetError)
      return new Response(
        JSON.stringify({ error: resetError.message || "Failed to generate reset link" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Extract the reset link from the response
    // The generateLink response structure: { properties: { action_link: string } }
    let resetLink = resetData.properties?.action_link

    if (!resetLink) {
      console.error("No reset link in response:", resetData)
      return new Response(
        JSON.stringify({ error: "Failed to generate reset link" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Extract the token from the generated link and construct our own URL
    // Supabase's verify endpoint format: /auth/v1/verify?token=...&type=recovery&redirect_to=...
    try {
      const url = new URL(resetLink)
      
      // Check if it's a Supabase verify endpoint
      if (url.pathname.includes('/auth/v1/verify')) {
        const token = url.searchParams.get('token')
        const type = url.searchParams.get('type')
        const redirectTo = url.searchParams.get('redirect_to')
        
        if (token && type === 'recovery') {
          // Construct a direct link to our reset password page
          // The verify endpoint will redirect here, and we'll handle the token
          resetLink = `${safeRedirectUrl}?token=${token}&type=${type}`
          console.log("Constructed custom reset link from verify endpoint")
        } else if (redirectTo && !redirectTo.includes('/reset-password')) {
          // Fix redirect_to if it's missing the path
          const fixedRedirect = redirectTo.endsWith('/') 
            ? `${redirectTo}reset-password`
            : `${redirectTo}/reset-password`
          url.searchParams.set('redirect_to', fixedRedirect)
          resetLink = url.toString()
          console.log("Fixed redirect_to to include /reset-password")
        }
      } else {
        // Try to extract access_token and refresh_token (for direct links)
        const accessToken = url.searchParams.get('access_token')
        const refreshToken = url.searchParams.get('refresh_token')
        const type = url.searchParams.get('type')
        
        if (accessToken && refreshToken && type === 'recovery') {
          // Construct our own reset link with production URL
          resetLink = `${safeRedirectUrl}?access_token=${accessToken}&refresh_token=${refreshToken}&type=${type}`
          console.log("Constructed custom reset link with tokens")
        }
      }
    } catch (urlError) {
      console.error("Error parsing reset link URL:", urlError)
      // If URL parsing fails, try to replace localhost in the original link
      if (resetLink.includes('localhost')) {
        resetLink = resetLink.replace(/https?:\/\/[^/]+/, safeRedirectUrl.split('/reset-password')[0])
        console.log("Replaced localhost in reset link")
      }
    }

    console.log("Reset link generated successfully:", resetLink.substring(0, 100) + "...")

    // Send password reset email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px 20px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: 600; }
          .button:hover { background-color: #1e40af; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e5e5e5; }
          .notice { background-color: #f59e0b; color: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Reset Your Password</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>You requested to reset your password for your <strong>Tasmanian Mental Health Directory</strong> account.</p>
            <p>Click the button below to create a new password:</p>
            <p style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #2563eb; font-size: 12px;">${resetLink}</p>
            <div class="notice">
              <p style="margin: 0;"><strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.</p>
            </div>
            <p>If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>This email was sent to ${email} for security purposes.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `

    console.log("Sending password reset email via Resend...")
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset Your Password - Tasmanian Mental Health Directory',
      html: emailHtml,
    })

    if (emailError) {
      console.error("Resend error:", emailError)
      return new Response(
        JSON.stringify({ error: emailError.message || "Failed to send email", details: emailError }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    console.log("Password reset email sent successfully:", emailData)
    return new Response(
      JSON.stringify({ success: true, message: "Password reset email sent" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  } catch (error: any) {
    console.error("Function error:", error)
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error", stack: error.stack }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})
