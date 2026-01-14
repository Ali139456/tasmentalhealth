import { loadStripe, type Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    if (!stripeKey) {
      console.warn('Stripe publishable key not found')
      return null
    }
    stripePromise = loadStripe(stripeKey)
  }
  return stripePromise
}

export async function createCheckoutSession(listingId: string, userId: string) {
  try {
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ listingId, userId }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create checkout session')
    }
    
    const { sessionId } = await response.json()
    return sessionId
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

export async function createPortalSession(customerId: string) {
  try {
    const response = await fetch('/api/stripe/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerId }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create portal session')
    }
    
    const { url } = await response.json()
    return url
  } catch (error) {
    console.error('Error creating portal session:', error)
    throw error
  }
}
