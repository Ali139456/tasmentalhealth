import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from "https://esm.sh/resend@2.0.0"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") || "Tasmanian Mental Health Directory <noreply@tasmentalhealthdirectory.com.au>"

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Verify the user
    const token = authHeader.replace("Bearer ", "")
    const { data: { user: requestingUser }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !requestingUser) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Verify the requesting user is an admin
    const { data: adminCheck } = await supabase
      .from("users")
      .select("role")
      .eq("id", requestingUser.id)
      .single()

    if (!adminCheck || adminCheck.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: "Only admins can delete users" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    const { userId } = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing userId" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Prevent deleting yourself
    if (userId === requestingUser.id) {
      return new Response(
        JSON.stringify({ error: "You cannot delete your own account" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Get user email BEFORE deletion
    const { data: userToDelete } = await supabase.auth.admin.getUserById(userId)
    const userEmail = userToDelete?.user?.email
    const userName = userEmail ? userEmail.split('@')[0] : ''

    // Send deletion email to user BEFORE deleting
    let emailSent = false
    if (userEmail && RESEND_API_KEY) {
      try {
        const resend = new Resend(RESEND_API_KEY)
        
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
              .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { padding: 30px 20px; }
              .warning { background-color: #f59e0b; color: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e5e5e5; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">Account Deleted</h1>
              </div>
              <div class="content">
                <p>Hello${userName ? ` ${userName}` : ''},</p>
                <p>We are writing to inform you that your account with the <strong>Tasmanian Mental Health Directory</strong> has been deleted by an administrator.</p>
                <div class="warning">
                  <p style="margin: 0;"><strong>What this means:</strong></p>
                  <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                    <li>Your account and all associated data have been permanently removed</li>
                    <li>All your listings have been deleted</li>
                    <li>You will no longer be able to access your dashboard</li>
                  </ul>
                </div>
                <p>If you believe this was done in error, please contact us immediately.</p>
                <p>If you have any questions or concerns, please don't hesitate to reach out to our support team.</p>
                <p>Best regards,<br>The Tasmanian Mental Health Directory Team</p>
              </div>
              <div class="footer">
                <p>This email was sent to ${userEmail}. If you have questions, please contact our support team.</p>
              </div>
            </div>
          </body>
          </html>
        `

        const emailResult = await resend.emails.send({
          from: FROM_EMAIL,
          to: userEmail,
          subject: 'Your Account Has Been Deleted - Tasmanian Mental Health Directory',
          html: emailHtml,
        })
        
        if (!emailResult.error) {
          emailSent = true
          console.log('Deletion email sent successfully to:', userEmail)
        } else {
          console.error('Failed to send deletion email:', emailResult.error)
        }
      } catch (err: any) {
        console.error('Error sending deletion email:', err)
        // Continue with deletion even if email fails
      }
    }

    // Delete user from auth.users (this will cascade delete from public.users due to foreign key)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error("Error deleting user:", deleteError)
      return new Response(
        JSON.stringify({ error: deleteError.message || "Failed to delete user" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "User deleted successfully",
        emailSent 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  } catch (error: any) {
    console.error("Function error:", error)
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})
