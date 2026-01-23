import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

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
