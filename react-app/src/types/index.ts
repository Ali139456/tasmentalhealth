export type UserRole = 'admin' | 'lister' | 'public'

export interface User {
  id: string
  email: string
  role: UserRole
  email_verified: boolean
  created_at: string
  updated_at: string
  profile?: UserProfile
}

export interface UserProfile {
  id: string
  user_id: string
  first_name?: string
  last_name?: string
  phone?: string
  created_at: string
  updated_at: string
}

export type ListingStatus = 'pending' | 'approved' | 'rejected' | 'needs_changes'

export interface Listing {
  id: string
  user_id: string
  practice_name: string
  email: string
  phone: string
  website?: string
  profession: string
  practice_type: 'individual' | 'group_practice' | 'non_profit'
  ahpra_number?: string
  accredited_member_number?: string
  verification_document_url?: string
  specialties: string[]
  location: string
  postcode: string
  street_address?: string
  is_telehealth: boolean
  is_rural_outreach: boolean
  is_statewide_telehealth: boolean
  bio?: string
  avatar_url?: string
  status: ListingStatus
  is_featured: boolean
  show_name_publicly: boolean
  show_email_publicly: boolean
  show_phone_publicly: boolean
  show_website_publicly: boolean
  created_at: string
  updated_at: string
  rejection_reason?: string
  needs_changes_notes?: string
}

export interface Subscription {
  id: string
  user_id: string
  listing_id: string
  stripe_subscription_id: string
  stripe_customer_id: string
  subscription_tier?: 'basic' | 'professional'
  status: 'active' | 'cancelled' | 'past_due' | 'expired'
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export interface EmailTemplate {
  type: 'signup_verification' | 'password_reset' | 'listing_approved' | 'listing_rejected' | 'listing_needs_changes' | 'subscription_confirmation'
  subject: string
  body: string
}
