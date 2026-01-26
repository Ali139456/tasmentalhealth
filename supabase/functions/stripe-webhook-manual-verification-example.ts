// ⚠️ NOT RECOMMENDED - Use stripe.webhooks.constructEvent() instead
// This is only for reference if you need manual verification

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Deno-compatible Stripe signature verification
async function verifyStripeSignature(
  payloadText: string,
  header: string | null,
  secret: string,
  tolerance = 300
): Promise<boolean> {
  if (!header) return false
  
  const parts = header.split(',')
  const map: Record<string, string> = {}
  for (const p of parts) {
    const [k, v] = p.split('=')
    if (k && v) map[k] = v
  }
  
  const t = map.t
  const sig = map.v1
  if (!t || !sig) return false
  
  const timestamp = parseInt(t, 10)
  const signedPayload = `${t}.${payloadText}`
  
  // Use Deno's crypto API instead of Node.js
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const messageData = encoder.encode(signedPayload)
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', key, messageData)
  const hexSignature = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  
  // Timing-safe comparison
  const isValid = timingSafeEqual(hexSignature, sig)
  
  const age = Math.abs(Math.floor(Date.now() / 1000) - timestamp)
  if (age > tolerance) return false
  
  return isValid
}

// Timing-safe comparison for Deno
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  
  const encoder = new TextEncoder()
  const aBytes = encoder.encode(a)
  const bBytes = encoder.encode(b)
  
  let result = 0
  for (let i = 0; i < aBytes.length; i++) {
    result |= aBytes[i] ^ bBytes[i]
  }
  return result === 0
}

serve(async (req) => {
  const payloadText = await req.text()
  const sigHeader = req.headers.get('stripe-signature') || req.headers.get('Stripe-Signature')
  const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  
  if (!secret) {
    console.error('STRIPE_WEBHOOK_SECRET not set')
    return new Response(
      JSON.stringify({ error: 'Server misconfiguration' }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    )
  }

  const ok = await verifyStripeSignature(payloadText, sigHeader, secret)
  if (!ok) {
    console.warn('Stripe signature verification failed')
    return new Response(
      JSON.stringify({ error: 'Invalid signature' }),
      { status: 400, headers: { 'Content-Type': 'application/json' }}
    )
  }

  try {
    const event = JSON.parse(payloadText)
    console.info('stripe event received', event.type)
    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    )
  } catch (e) {
    console.error('Invalid JSON payload')
    return new Response(
      JSON.stringify({ error: 'Invalid JSON' }),
      { status: 400, headers: { 'Content-Type': 'application/json' }}
    )
  }
})
