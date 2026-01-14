// NOTE: This should be called through a backend API, not directly from the client
// See BACKEND_SETUP.md for implementation options
import { supabase } from './supabase'

export interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail(options: EmailOptions) {
  try {
    // Option 1: Use Supabase Edge Function (recommended)
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: options
    })

    if (error) throw error
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
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}

export function getEmailTemplate(type: string, data: Record<string, any>): { subject: string; html: string } {
  const templates: Record<string, (data: Record<string, any>) => { subject: string; html: string }> = {
    signup_verification: (data) => ({
      subject: 'Verify Your Email - Tasmanian Mental Health Directory',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Welcome to Tasmanian Mental Health Directory</h2>
            <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
            <a href="${data.verificationUrl}" class="button">Verify Email</a>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p>${data.verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
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
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Password Reset Request</h2>
            <p>You requested to reset your password. Click the button below to create a new password:</p>
            <a href="${data.resetUrl}" class="button">Reset Password</a>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p>${data.resetUrl}</p>
            <p>This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
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
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .success { background-color: #10b981; color: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">
              <h2>✓ Listing Approved!</h2>
            </div>
            <p>Dear ${data.userName || 'User'},</p>
            <p>Great news! Your listing "<strong>${data.listingName}</strong>" has been approved and is now live on the Tasmanian Mental Health Directory.</p>
            <p>You can view your listing and manage it from your dashboard.</p>
            <p><a href="${data.dashboardUrl}">Go to Dashboard</a></p>
            <p>Thank you for being part of our directory!</p>
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
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .notice { background-color: #f59e0b; color: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="notice">
              <h2>Listing Status Update</h2>
            </div>
            <p>Dear ${data.userName || 'User'},</p>
            <p>Unfortunately, your listing "<strong>${data.listingName}</strong>" has been rejected.</p>
            ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
            <p>If you have questions or would like to resubmit, please contact us.</p>
            <p><a href="${data.dashboardUrl}">View Dashboard</a></p>
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
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .notice { background-color: #3b82f6; color: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="notice">
              <h2>Listing Needs Changes</h2>
            </div>
            <p>Dear ${data.userName || 'User'},</p>
            <p>Your listing "<strong>${data.listingName}</strong>" needs some changes before it can be approved.</p>
            ${data.notes ? `<p><strong>Required Changes:</strong><br>${data.notes}</p>` : ''}
            <p>Please update your listing and resubmit for review.</p>
            <p><a href="${data.dashboardUrl}">Update Listing</a></p>
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
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .success { background-color: #10b981; color: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">
              <h2>✓ Subscription Active!</h2>
            </div>
            <p>Dear ${data.userName || 'User'},</p>
            <p>Your subscription for featured listing "<strong>${data.listingName}</strong>" is now active.</p>
            <p><strong>Subscription Status:</strong> ${data.status}</p>
            <p><strong>Next Billing Date:</strong> ${data.nextBillingDate}</p>
            <p>Your listing is now featured and will appear higher in search results.</p>
            <p><a href="${data.dashboardUrl}">Manage Subscription</a></p>
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
