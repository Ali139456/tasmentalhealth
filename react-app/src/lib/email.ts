// NOTE: This should be called through a backend API, not directly from the client
// See BACKEND_SETUP.md for implementation options
import { supabase } from './supabase'

// Email validation function - simplified to avoid blocking valid emails
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return false
  
  // Check for obviously invalid patterns (less strict)
  const invalidPatterns = [
    /@example\./i,
    /@localhost/i,
    /^[a-z0-9]+@[a-z0-9]+$/i, // Missing TLD (e.g., test@test)
  ]
  
  // Check if email matches any invalid pattern
  for (const pattern of invalidPatterns) {
    if (pattern.test(email)) {
      return false
    }
  }
  
  // Check for valid TLD (at least 2 characters)
  const parts = email.split('@')
  if (parts.length !== 2) return false
  
  const domain = parts[1]
  const domainParts = domain.split('.')
  if (domainParts.length < 2) return false
  
  const tld = domainParts[domainParts.length - 1]
  if (tld.length < 2) return false
  
  return true
}

// Get admin email addresses - with timeout to prevent hanging
export async function getAdminEmails(): Promise<string[]> {
  try {
    // Add timeout to prevent hanging
    const queryPromise = supabase
      .from('users')
      .select('email')
      .eq('role', 'admin')
      .eq('email_verified', true)

    const timeoutPromise = new Promise<{ data: null; error: { message: 'Timeout' } }>((resolve) => 
      setTimeout(() => resolve({ data: null, error: { message: 'Timeout' } }), 5000)
    )

    const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any

    if (error) {
      console.error('Error fetching admin emails:', error)
      return []
    }

    return data?.map((user: any) => user.email).filter(Boolean) || []
  } catch (err) {
    console.error('Error fetching admin emails:', err)
    return []
  }
}

export interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail(options: EmailOptions) {
  try {
    console.log('Attempting to send email via Edge Function:', {
      to: options.to,
      subject: options.subject,
      hasHtml: !!options.html
    })

    // Option 1: Use Supabase Edge Function (recommended)
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: options
    })

    if (error) {
      console.error('Supabase Edge Function error:', error)
      throw error
    }

    console.log('Email sent successfully via Edge Function:', data)
    return { success: true, data }

    // Option 2: Use custom API endpoint
    // const response = await fetch('/api/send-email', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(options)
    // })
    // const result = await response.json()
    // if (!response.ok) throw new Error(result.error)
    // return { success: true, data: result.data }
  } catch (error: any) {
    console.error('Email send error details:', {
      error,
      message: error?.message,
      details: error?.details,
      hint: error?.hint
    })
    return { success: false, error: error?.message || 'Unknown error' }
  }
}

// Helper function to get app URL
export function getAppUrl(): string {
  // Try to get from environment variable first
  const envUrl = import.meta.env.VITE_APP_URL
  if (envUrl) {
    return envUrl
  }
  // Fallback to window location (for browser)
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  // Final fallback
  return 'https://www.tasmentalhealthdirectory.com.au'
}

export function getEmailTemplate(type: string, data: Record<string, any>): { subject: string; html: string } {
  const appUrl = data.appUrl || getAppUrl()
  const baseStyles = `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { padding: 30px 20px; }
    .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: 600; }
    .button:hover { background-color: #1e40af; }
    .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e5e5e5; }
    .success { background-color: #10b981; color: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .notice { background-color: #3b82f6; color: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .warning { background-color: #f59e0b; color: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
  `

  const templates: Record<string, (data: Record<string, any>) => { subject: string; html: string }> = {
    welcome: (data) => ({
      subject: 'Welcome to Tasmanian Mental Health Directory',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${baseStyles}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Welcome!</h1>
            </div>
            <div class="content">
              <p>Hello${data.userName ? ` ${data.userName}` : ''},</p>
              <p>Thank you for creating an account with the <strong>Tasmanian Mental Health Directory</strong>!</p>
              <p>Your account has been successfully created. You can now:</p>
              <ul>
                <li>Access your dashboard to manage your listings</li>
                <li>Submit new listings for mental health professionals</li>
                <li>Update your profile information</li>
              </ul>
              <p style="text-align: center;">
                <a href="${appUrl}/dashboard" class="button">Go to Dashboard</a>
              </p>
              <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
              <p>Best regards,<br>The Tasmanian Mental Health Directory Team</p>
            </div>
            <div class="footer">
              <p>This email was sent to ${data.email || 'you'}. If you didn't create this account, please ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }),
    account_activated: (data) => ({
      subject: 'Account Activated - Tasmanian Mental Health Directory',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${baseStyles}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Account Activated</h1>
            </div>
            <div class="content">
              <div class="success">
                <h2 style="margin: 0;">✓ Email Verified Successfully!</h2>
              </div>
              <p>Hello${data.userName ? ` ${data.userName}` : ''},</p>
              <p>Your email address has been verified and your account is now fully activated.</p>
              <p>You can now access all features of the Tasmanian Mental Health Directory.</p>
              <p style="text-align: center;">
                <a href="${appUrl}/dashboard" class="button">Go to Dashboard</a>
              </p>
              <p>Thank you for verifying your email address!</p>
            </div>
            <div class="footer">
              <p>This email was sent to ${data.email || 'you'}.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }),
    password_changed: (data) => ({
      subject: 'Password Changed - Tasmanian Mental Health Directory',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${baseStyles}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Password Changed</h1>
            </div>
            <div class="content">
              <div class="notice">
                <h2 style="margin: 0;">🔒 Security Notification</h2>
              </div>
              <p>Hello${data.userName ? ` ${data.userName}` : ''},</p>
              <p>This is a security notification to confirm that your password was successfully changed on <strong>${new Date().toLocaleString('en-AU', { dateStyle: 'long', timeStyle: 'short' })}</strong>.</p>
              <p><strong>If you made this change:</strong> You can safely ignore this email.</p>
              <p><strong>If you did NOT make this change:</strong> Please contact us immediately and consider changing your password again.</p>
              <p style="text-align: center;">
                <a href="${appUrl}/dashboard" class="button">Go to Dashboard</a>
              </p>
              <p>For your security, if you have any concerns, please contact our support team immediately.</p>
            </div>
            <div class="footer">
              <p>This email was sent to ${data.email || 'you'} for security purposes.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }),
    password_reset_confirmation: (data) => ({
      subject: 'Password Reset Successful - Tasmanian Mental Health Directory',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${baseStyles}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Password Reset Complete</h1>
            </div>
            <div class="content">
              <div class="success">
                <h2 style="margin: 0;">✓ Password Successfully Reset!</h2>
              </div>
              <p>Hello${data.userName ? ` ${data.userName}` : ''},</p>
              <p>Your password has been successfully reset on <strong>${new Date().toLocaleString('en-AU', { dateStyle: 'long', timeStyle: 'short' })}</strong>.</p>
              <p>You can now log in with your new password.</p>
              <p style="text-align: center;">
                <a href="${appUrl}/login" class="button">Log In Now</a>
              </p>
              <p><strong>If you did NOT reset your password:</strong> Please contact us immediately as your account may be compromised.</p>
            </div>
            <div class="footer">
              <p>This email was sent to ${data.email || 'you'} for security purposes.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }),
    lister_account_created: (data) => ({
      subject: 'Lister Account Created - Tasmanian Mental Health Directory',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${baseStyles}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Welcome, New Lister!</h1>
            </div>
            <div class="content">
              <p>Hello${data.userName ? ` ${data.userName}` : ''},</p>
              <p>Thank you for submitting your listing to the <strong>Tasmanian Mental Health Directory</strong>!</p>
              <p>Your lister account has been created and your listing "<strong>${data.listingName || 'your listing'}</strong>" has been submitted for review.</p>
              <p><strong>What happens next?</strong></p>
              <ul>
                <li>Our team will review your listing</li>
                <li>You'll receive an email once your listing is approved</li>
                <li>Once approved, your listing will appear in our directory</li>
              </ul>
              ${data.temporaryPassword ? `
                <div class="notice">
                  <p><strong>Your temporary password:</strong> ${data.temporaryPassword}</p>
                  <p style="margin: 10px 0 0 0; font-size: 12px;">Please change this password after your first login for security.</p>
                </div>
              ` : ''}
              <p style="text-align: center;">
                <a href="${appUrl}/login" class="button">Log In to Your Account</a>
              </p>
              <p>If you have any questions, please don't hesitate to contact us.</p>
            </div>
            <div class="footer">
              <p>This email was sent to ${data.email || 'you'}.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }),
    listing_submitted: (data) => ({
      subject: 'Listing Submitted for Review - Tasmanian Mental Health Directory',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${baseStyles}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Listing Submitted</h1>
            </div>
            <div class="content">
              <div class="notice">
                <h2 style="margin: 0;">✓ Listing Received</h2>
              </div>
              <p>Hello${data.userName ? ` ${data.userName}` : ''},</p>
              <p>Thank you for submitting your listing "<strong>${data.listingName || 'your listing'}</strong>" to the Tasmanian Mental Health Directory.</p>
              <p><strong>What happens next?</strong></p>
              <ul>
                <li>Our team will review your listing</li>
                <li>We'll check all the information you provided</li>
                <li>You'll receive an email notification once the review is complete</li>
              </ul>
              <p><strong>Review Status:</strong> Pending</p>
              <p>You can check the status of your listing at any time from your dashboard.</p>
              <p style="text-align: center;">
                <a href="${appUrl}/dashboard" class="button">View Dashboard</a>
              </p>
              <p>We appreciate your patience during the review process.</p>
            </div>
            <div class="footer">
              <p>This email was sent to ${data.email || 'you'}.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }),
    signup_verification: (data) => ({
      subject: 'Verify Your Email - Tasmanian Mental Health Directory',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${baseStyles}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Verify Your Email</h1>
            </div>
            <div class="content">
              <p>Hello${data.userName ? ` ${data.userName}` : ''},</p>
              <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
              <p style="text-align: center;">
                <a href="${data.verificationUrl}" class="button">Verify Email</a>
              </p>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #2563eb;">${data.verificationUrl}</p>
              <p><strong>This link will expire in 24 hours.</strong></p>
            </div>
            <div class="footer">
              <p>This email was sent to ${data.email || 'you'}. If you didn't create this account, please ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }),
    password_reset: (data) => ({
      subject: 'Reset Your Password - Tasmanian Mental Health Directory',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${baseStyles}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello${data.userName ? ` ${data.userName}` : ''},</p>
              <p>You requested to reset your password. Click the button below to create a new password:</p>
              <p style="text-align: center;">
                <a href="${data.resetUrl}" class="button">Reset Password</a>
              </p>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #2563eb;">${data.resetUrl}</p>
              <p><strong>This link will expire in 1 hour.</strong></p>
              <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            </div>
            <div class="footer">
              <p>This email was sent to ${data.email || 'you'} for security purposes.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }),
    listing_approved: (data) => ({
      subject: 'Your Listing Has Been Approved - Tasmanian Mental Health Directory',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${baseStyles}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Listing Approved!</h1>
            </div>
            <div class="content">
              <div class="success">
                <h2 style="margin: 0;">✓ Your Listing is Live!</h2>
              </div>
              <p>Hello${data.userName ? ` ${data.userName}` : ''},</p>
              <p>Great news! Your listing "<strong>${data.listingName}</strong>" has been approved and is now live on the Tasmanian Mental Health Directory.</p>
              <p>You can view your listing and manage it from your dashboard.</p>
              <p style="text-align: center;">
                <a href="${data.dashboardUrl || `${appUrl}/dashboard`}" class="button">Go to Dashboard</a>
              </p>
              <p>Thank you for being part of our directory!</p>
            </div>
            <div class="footer">
              <p>This email was sent to ${data.email || 'you'}.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }),
    listing_rejected: (data) => ({
      subject: 'Listing Status Update - Tasmanian Mental Health Directory',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${baseStyles}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Listing Status Update</h1>
            </div>
            <div class="content">
              <div class="warning">
                <h2 style="margin: 0;">Listing Rejected</h2>
              </div>
              <p>Hello${data.userName ? ` ${data.userName}` : ''},</p>
              <p>Unfortunately, your listing "<strong>${data.listingName}</strong>" has been rejected.</p>
              ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
              <p>If you have questions or would like to resubmit, please contact us.</p>
              <p style="text-align: center;">
                <a href="${data.dashboardUrl || `${appUrl}/dashboard`}" class="button">View Dashboard</a>
              </p>
            </div>
            <div class="footer">
              <p>This email was sent to ${data.email || 'you'}.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }),
    listing_needs_changes: (data) => ({
      subject: 'Listing Needs Changes - Tasmanian Mental Health Directory',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${baseStyles}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Listing Needs Changes</h1>
            </div>
            <div class="content">
              <div class="notice">
                <h2 style="margin: 0;">Action Required</h2>
              </div>
              <p>Hello${data.userName ? ` ${data.userName}` : ''},</p>
              <p>Your listing "<strong>${data.listingName}</strong>" needs some changes before it can be approved.</p>
              ${data.notes ? `<p><strong>Required Changes:</strong><br>${data.notes}</p>` : ''}
              <p>Please update your listing and resubmit for review.</p>
              <p style="text-align: center;">
                <a href="${data.dashboardUrl || `${appUrl}/dashboard`}" class="button">Update Listing</a>
              </p>
            </div>
            <div class="footer">
              <p>This email was sent to ${data.email || 'you'}.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }),
    subscription_confirmation: (data) => ({
      subject: 'Subscription Confirmed - Tasmanian Mental Health Directory',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${baseStyles}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Subscription Active</h1>
            </div>
            <div class="content">
              <div class="success">
                <h2 style="margin: 0;">✓ Subscription Confirmed!</h2>
              </div>
              <p>Hello${data.userName ? ` ${data.userName}` : ''},</p>
              <p>Your subscription for featured listing "<strong>${data.listingName}</strong>" is now active.</p>
              <p><strong>Subscription Status:</strong> ${data.status}</p>
              <p><strong>Next Billing Date:</strong> ${data.nextBillingDate}</p>
              <p>Your listing is now featured and will appear higher in search results.</p>
              <p style="text-align: center;">
                <a href="${data.dashboardUrl || `${appUrl}/dashboard`}" class="button">Manage Subscription</a>
              </p>
            </div>
            <div class="footer">
              <p>This email was sent to ${data.email || 'you'}.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }),
    account_deleted: (data) => ({
      subject: 'Your Account Has Been Deleted - Tasmanian Mental Health Directory',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${baseStyles}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Account Deleted</h1>
            </div>
            <div class="content">
              <p>Hello${data.userName ? ` ${data.userName}` : ''},</p>
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
              <p>This email was sent to ${data.email || 'you'}. If you have questions, please contact our support team.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }),
    admin_user_signup: (data) => ({
      subject: 'New User Signup - Tasmanian Mental Health Directory',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${baseStyles}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">New User Signup</h1>
            </div>
            <div class="content">
              <p>Hello Admin,</p>
              <p>A new user has signed up for the <strong>Tasmanian Mental Health Directory</strong>.</p>
              <div class="notice">
                <p style="margin: 0;"><strong>User Details:</strong></p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li><strong>Email:</strong> ${data.email || 'N/A'}</li>
                  <li><strong>User ID:</strong> ${data.userId || 'N/A'}</li>
                  <li><strong>Signup Date:</strong> ${data.signupDate || new Date().toLocaleString()}</li>
                </ul>
              </div>
              <p style="text-align: center;">
                <a href="${appUrl}/admin" class="button">View in Admin Panel</a>
              </p>
              <p>Best regards,<br>Tasmanian Mental Health Directory System</p>
            </div>
            <div class="footer">
              <p>This is an automated notification from the Tasmanian Mental Health Directory.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }),
    admin_listing_submitted: (data) => ({
      subject: 'New Listing Submitted - Tasmanian Mental Health Directory',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${baseStyles}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">New Listing Submitted</h1>
            </div>
            <div class="content">
              <p>Hello Admin,</p>
              <p>A new listing has been submitted to the <strong>Tasmanian Mental Health Directory</strong> and is awaiting your review.</p>
              <div class="notice">
                <p style="margin: 0;"><strong>Listing Details:</strong></p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li><strong>Practice Name:</strong> ${data.practiceName || 'N/A'}</li>
                  <li><strong>Profession:</strong> ${data.profession || 'N/A'}</li>
                  <li><strong>Location:</strong> ${data.location || 'N/A'}</li>
                  <li><strong>Submitted By:</strong> ${data.userEmail || 'N/A'}</li>
                  <li><strong>Submission Date:</strong> ${data.submissionDate || new Date().toLocaleString()}</li>
                </ul>
              </div>
              <p style="text-align: center;">
                <a href="${appUrl}/admin" class="button">Review Listing</a>
              </p>
              <p>Best regards,<br>Tasmanian Mental Health Directory System</p>
            </div>
            <div class="footer">
              <p>This is an automated notification from the Tasmanian Mental Health Directory.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }),
    event_subscription: (data) => ({
      subject: 'You\'re Subscribed to Event Notifications - Tasmanian Mental Health Directory',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${baseStyles}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Event Notifications</h1>
            </div>
            <div class="content">
              <div class="success">
                <h2 style="margin: 0;">✓ You're Subscribed!</h2>
              </div>
              <p>Hello${data.userName ? ` ${data.userName}` : ''},</p>
              <p>Thank you for subscribing to event notifications from the <strong>Tasmanian Mental Health Directory</strong>!</p>
              <p>We're currently working hard to bring you a comprehensive calendar of mental health events, including:</p>
              <ul>
                <li>Workshops and training sessions</li>
                <li>Support groups and community meetings</li>
                <li>Mental health seminars and conferences</li>
                <li>Professional development opportunities</li>
              </ul>
              <p>You'll be among the first to know when our event calendar launches. We'll notify you at <strong>${data.email}</strong> as soon as events become available.</p>
              <p style="text-align: center;">
                <a href="${appUrl}/events" class="button">Visit Events Page</a>
              </p>
              <p>Thank you for your interest in supporting mental health in Tasmania!</p>
              <p>Best regards,<br>The Tasmanian Mental Health Directory Team</p>
            </div>
            <div class="footer">
              <p>This email was sent to ${data.email || 'you'}. If you didn't subscribe, please ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    })
  }

  const template = templates[type]
  if (!template) {
    throw new Error(`Email template ${type} not found`)
  }
  return template(data)
}
