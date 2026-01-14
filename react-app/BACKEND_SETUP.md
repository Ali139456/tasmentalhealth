# Backend API Setup

The email functionality requires a backend API since Resend API keys should not be exposed in the client-side code.

## Option 1: Supabase Edge Functions (Recommended)

Create a Supabase Edge Function to handle email sending:

### Create the function:

```bash
supabase functions new send-email
```

### Function code (`supabase/functions/send-email/index.ts`):

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "https://esm.sh/resend@2.0.0"

const resend = new Resend(Deno.env.get("RESEND_API_KEY"))

serve(async (req) => {
  try {
    const { to, subject, html } = await req.json()

    const { data, error } = await resend.emails.send({
      from: "Tasmanian Mental Health Directory <noreply@yourdomain.com>",
      to,
      subject,
      html,
    })

    if (error) {
      return new Response(JSON.stringify({ error }), { status: 400 })
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    })
  }
})
```

### Deploy:

```bash
supabase functions deploy send-email
```

### Update client code:

In `src/lib/email.ts`, change the `sendEmail` function to call the Supabase function:

```typescript
export async function sendEmail(options: EmailOptions) {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: options
    })

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}
```

## Option 2: Express.js API

Create a simple Express.js API:

### Install dependencies:

```bash
npm install express cors dotenv resend
```

### Create `server/index.js`:

```javascript
const express = require('express')
const cors = require('cors')
const { Resend } = require('resend')
require('dotenv').config()

const app = express()
const resend = new Resend(process.env.RESEND_API_KEY)

app.use(cors())
app.use(express.json())

app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html } = req.body

    const { data, error } = await resend.emails.send({
      from: 'Tasmanian Mental Health Directory <noreply@yourdomain.com>',
      to,
      subject,
      html,
    })

    if (error) {
      return res.status(400).json({ error })
    }

    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

### Update client code:

In `src/lib/email.ts`:

```typescript
export async function sendEmail(options: EmailOptions) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    })

    const result = await response.json()
    if (!response.ok) throw new Error(result.error)
    return { success: true, data: result.data }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}
```

## Stripe Webhooks

For Stripe subscription management, set up webhooks:

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### Webhook handler example:

```javascript
app.post('/api/stripe/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      // Update subscription in database
      await updateSubscription(event.data.object)
      break
    case 'customer.subscription.deleted':
      // Mark subscription as cancelled
      await cancelSubscription(event.data.object.id)
      break
    // ... handle other event types
  }

  res.json({received: true})
})
```

## Environment Variables for Backend

Add to your backend `.env`:

```
RESEND_API_KEY=your_resend_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```
