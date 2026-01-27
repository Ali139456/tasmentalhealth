import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') || 'Tasmanian Mental Health Directory <noreply@tasmentalhealthdirectory.com.au>'
const APP_URL = Deno.env.get('APP_URL') || 'https://www.tasmentalhealthdirectory.com.au'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('send-verification-email function called')
    
    // Check required environment variables
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase configuration:', {
        hasUrl: !!SUPABASE_URL,
        hasServiceKey: !!SUPABASE_SERVICE_ROLE_KEY
      })
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('Missing authorization header')
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Verify the user's token
    const token = authHeader.replace('Bearer ', '')
    console.log('Verifying user token...')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token', details: authError?.message }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('User verified:', user.email)
    const { email } = await req.json()
    console.log('Request email:', email, 'User email:', user.email)
    
    if (!email || email !== user.email) {
      console.error('Email mismatch:', { requestEmail: email, userEmail: user.email })
      return new Response(
        JSON.stringify({ error: 'Email mismatch' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Generate verification link using admin API
    // For existing users who need email verification, use 'magiclink' type
    // This creates a one-time link that verifies the email when clicked
    console.log('Generating verification link for existing user:', email)
    
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${APP_URL}/dashboard`,
      }
    })

    if (linkError) {
      console.error('Error generating verification link:', JSON.stringify(linkError, null, 2))
      return new Response(
        JSON.stringify({ 
          error: 'Failed to generate verification link', 
          details: linkError.message 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!linkData?.properties?.action_link) {
      console.error('No action_link in response:', linkData)
      return new Response(
        JSON.stringify({ error: 'Failed to generate verification link - no link in response' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const verificationUrl = linkData.properties.action_link

    // Extract token from URL if it's a verify endpoint
    // Magiclink URLs can be in different formats, so we handle multiple cases
    let finalVerificationUrl = verificationUrl
    try {
      const url = new URL(verificationUrl)
      
      // Check if it's a Supabase verify endpoint
      if (url.pathname.includes('/auth/v1/verify')) {
        const token = url.searchParams.get('token') || url.searchParams.get('token_hash')
        const type = url.searchParams.get('type') || 'magiclink'
        if (token) {
          // Construct direct verification URL with token in query params (not hash)
          finalVerificationUrl = `${APP_URL}/auth/verify?token=${encodeURIComponent(token)}&type=${encodeURIComponent(type)}`
        } else {
          // If no token in query params, check hash fragment
          const hash = url.hash
          if (hash) {
            const hashParams = new URLSearchParams(hash.substring(1))
            const hashToken = hashParams.get('token') || hashParams.get('token_hash') || hashParams.get('access_token')
            const hashType = hashParams.get('type') || 'magiclink'
            if (hashToken) {
              finalVerificationUrl = `${APP_URL}/auth/verify?token=${encodeURIComponent(hashToken)}&type=${encodeURIComponent(hashType)}`
            }
          }
        }
      } 
      // Check for token_hash in query params (used by magiclink)
      else if (url.searchParams.has('token_hash')) {
        const tokenHash = url.searchParams.get('token_hash')
        const type = url.searchParams.get('type') || 'magiclink'
        if (tokenHash) {
          finalVerificationUrl = `${APP_URL}/auth/verify?token=${encodeURIComponent(tokenHash)}&type=${encodeURIComponent(type)}`
        }
      }
      // Check hash fragment for tokens
      else if (url.hash) {
        const hashParams = new URLSearchParams(url.hash.substring(1))
        const hashToken = hashParams.get('token') || hashParams.get('token_hash') || hashParams.get('access_token')
        const hashType = hashParams.get('type') || 'magiclink'
        if (hashToken) {
          finalVerificationUrl = `${APP_URL}/auth/verify?token=${encodeURIComponent(hashToken)}&type=${encodeURIComponent(hashType)}`
        }
      }
      // If it's already a direct link to our app, use it as-is
      else if (verificationUrl.includes(APP_URL)) {
        finalVerificationUrl = verificationUrl
      }
    } catch (urlError) {
      console.error('Error parsing verification URL:', urlError)
      // Use original URL if parsing fails
      finalVerificationUrl = verificationUrl
    }
    
    console.log('Final verification URL:', finalVerificationUrl.substring(0, 100) + '...')

    // Send email via Resend
    console.log('Sending email via Resend to:', email)
    console.log('Using FROM_EMAIL:', FROM_EMAIL)
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #39B8A6 0%, #2E9385 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #39B8A6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; font-size: 16px; text-align: center; border: none; cursor: pointer; }
          .button:hover { background-color: #2E9385; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Thank you for signing up for the Tasmanian Mental Health Directory! Please verify your email address by clicking the button below:</p>
            <p style="text-align: center;">
              <a href="${finalVerificationUrl}" class="button">Confirm Your Email</a>
            </p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #39B8A6;">${finalVerificationUrl}</p>
            <p><strong>This link will expire in 24 hours.</strong></p>
            <p>If you didn't create this account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>This email was sent to ${email}. If you didn't request this, please ignore it.</p>
            <p>&copy; ${new Date().getFullYear()} Tasmanian Mental Health Directory. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: email,
        subject: 'Verify Your Email - Tasmanian Mental Health Directory',
        html: emailHtml,
      }),
    })

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text()
      console.error('Resend API error:', errorData)
      console.error('Resend response status:', resendResponse.status)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send email', 
          details: errorData,
          status: resendResponse.status
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const resendData = await resendResponse.json()
    console.log('Verification email sent successfully:', resendData)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification email sent successfully',
        emailId: resendData.id 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error: any) {
    console.error('Error in send-verification-email function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.stack 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
