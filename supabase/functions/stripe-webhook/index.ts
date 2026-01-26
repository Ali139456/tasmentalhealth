import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const APP_URL = Deno.env.get("APP_URL") || "https://www.tasmentalhealthdirectory.com.au"

if (!STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY environment variable is required")
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
})

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
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
    const signature = req.headers.get("stripe-signature")
    
    if (!signature && STRIPE_WEBHOOK_SECRET) {
      return new Response(
        JSON.stringify({ error: "Missing stripe-signature header" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    const body = await req.text()
    let event: Stripe.Event

    // Verify webhook signature if secret is provided
    if (STRIPE_WEBHOOK_SECRET && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)
      } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message)
        return new Response(
          JSON.stringify({ error: `Webhook Error: ${err.message}` }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        )
      }
    } else {
      // For development/testing without webhook secret
      event = JSON.parse(body) as Stripe.Event
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription)
        break
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  } catch (error: any) {
    console.error("Webhook error:", error)
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id
  const listingId = session.metadata?.listing_id
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string

  if (!userId || !listingId || !subscriptionId) {
    console.error("Missing required metadata in checkout session")
    return
  }

  // Get subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  // Update listing to featured
  await supabase
    .from("listings")
    .update({ is_featured: true })
    .eq("id", listingId)

  // Create or update subscription record
  await supabase
    .from("subscriptions")
    .upsert({
      user_id: userId,
      listing_id: listingId,
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: customerId,
      status: subscription.status === 'active' ? 'active' : 'past_due',
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end || false,
    }, {
      onConflict: 'stripe_subscription_id'
    })

  // Send subscription confirmation email
  try {
    // Get user and listing details
    const { data: userData } = await supabase
      .from("users")
      .select("email")
      .eq("id", userId)
      .single()

    const { data: listingData } = await supabase
      .from("listings")
      .select("practice_name")
      .eq("id", listingId)
      .single()

    if (userData?.email && listingData?.practice_name) {
      // Invoke send-email function
      await supabase.functions.invoke('send-email', {
        body: {
          to: userData.email,
          subject: 'Subscription Confirmed - Tasmanian Mental Health Directory',
          html: `
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
                .success { background-color: #10b981; color: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
                .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e5e5e5; }
              </style>
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
                  <p>Hello,</p>
                  <p>Your subscription for featured listing "<strong>${listingData.practice_name}</strong>" is now active.</p>
                  <p><strong>Subscription Status:</strong> ${subscription.status === 'active' ? 'Active' : 'Past Due'}</p>
                  <p><strong>Next Billing Date:</strong> ${new Date(subscription.current_period_end * 1000).toLocaleDateString('en-AU', { dateStyle: 'long' })}</p>
                  <p>Your listing is now featured and will appear higher in search results.</p>
                  <p style="text-align: center;">
                    <a href="${APP_URL}/dashboard" class="button">Manage Subscription</a>
                  </p>
                </div>
                <div class="footer">
                  <p>This email was sent to ${userData.email}.</p>
                </div>
              </div>
            </body>
            </html>
          `
        }
      })
      console.log('Subscription confirmation email sent to:', userData.email)
    }
  } catch (emailError) {
    console.error('Failed to send subscription confirmation email:', emailError)
    // Don't fail webhook if email fails
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  // Find the subscription in our database
  const { data: existingSub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("stripe_subscription_id", subscription.id)
    .single()

  if (!existingSub) {
    console.error("Subscription not found in database:", subscription.id)
    return
  }

  // Update subscription status
  const status = subscription.status === 'active' ? 'active' : 
                 subscription.status === 'canceled' ? 'cancelled' : 
                 subscription.status === 'past_due' ? 'past_due' : 'expired'

  await supabase
    .from("subscriptions")
    .update({
      status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end || false,
    })
    .eq("stripe_subscription_id", subscription.id)

  // If subscription is cancelled or expired, remove featured status
  if (status === 'cancelled' || status === 'expired') {
    await supabase
      .from("listings")
      .update({ is_featured: false })
      .eq("id", existingSub.listing_id)
  } else if (status === 'active') {
    // Ensure listing is featured if subscription is active
    await supabase
      .from("listings")
      .update({ is_featured: true })
      .eq("id", existingSub.listing_id)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Find the subscription in our database
  const { data: existingSub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("stripe_subscription_id", subscription.id)
    .single()

  if (!existingSub) {
    console.error("Subscription not found in database:", subscription.id)
    return
  }

  // Update subscription status to cancelled
  await supabase
    .from("subscriptions")
    .update({
      status: 'cancelled',
    })
    .eq("stripe_subscription_id", subscription.id)

  // Remove featured status from listing
  await supabase
    .from("listings")
    .update({ is_featured: false })
    .eq("id", existingSub.listing_id)
}
