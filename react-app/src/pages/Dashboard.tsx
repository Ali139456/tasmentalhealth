import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { Listing, Subscription } from '../types'
import { CheckCircle, XCircle, Clock, AlertCircle, Star, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { useSearchParams } from 'react-router-dom'
import { createCheckoutSession, createPortalSession } from '../lib/stripe'

export function Dashboard() {
  const { user } = useAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingListingId, setProcessingListingId] = useState<string | null>(null)
  const [processingPortal, setProcessingPortal] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  // Check for success/cancel messages from Stripe redirect
  useEffect(() => {
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')
    
    if (success === 'true') {
      // Refresh data to show updated subscription
      fetchData()
      // Remove query param
      setSearchParams({})
      alert('Payment successful! Your listing is now featured.')
    } else if (canceled === 'true') {
      setSearchParams({})
      alert('Payment was canceled.')
    }
  }, [searchParams, setSearchParams])

  const fetchData = async () => {
    try {
      // Fetch listings
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (listingsError) throw listingsError
      setListings(listingsData || [])

      // Fetch subscription
      if (listingsData && listingsData.length > 0) {
        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user?.id)
          .eq('status', 'active')
          .single()

        if (!subError && subData) {
          setSubscription(subData)
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgradeToFeatured = async (listingId: string) => {
    try {
      setProcessingListingId(listingId)
      const { url } = await createCheckoutSession(listingId)
      
      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error)
      alert(error.message || 'Failed to start checkout. Please try again.')
      setProcessingListingId(null)
    }
  }

  const handleManageSubscription = async () => {
    try {
      setProcessingPortal(true)
      const url = await createPortalSession()
      
      if (url) {
        // Redirect to Stripe Customer Portal
        window.location.href = url
      } else {
        throw new Error('No portal URL received')
      }
    } catch (error: any) {
      console.error('Error creating portal session:', error)
      alert(error.message || 'Failed to open customer portal. Please try again.')
      setProcessingPortal(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      approved: { icon: CheckCircle, color: 'text-green-600 bg-green-50', label: 'Approved' },
      pending: { icon: Clock, color: 'text-yellow-600 bg-yellow-50', label: 'Pending' },
      rejected: { icon: XCircle, color: 'text-red-600 bg-red-50', label: 'Rejected' },
      needs_changes: { icon: AlertCircle, color: 'text-blue-600 bg-blue-50', label: 'Needs Changes' }
    }

    const badge = badges[status as keyof typeof badges] || badges.pending
    const Icon = badge.icon

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {badge.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
          <p className="text-gray-600">Manage your listings and subscription</p>
        </div>

        {/* Subscription Status */}
        {subscription && (
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Star className="w-8 h-8 mr-3" />
                <div>
                  <h3 className="text-xl font-bold">Featured Listing Active</h3>
                  <p className="text-yellow-100">
                    Next billing: {format(new Date(subscription.current_period_end), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              <button 
                onClick={handleManageSubscription}
                disabled={processingPortal}
                className="px-4 py-2 bg-white text-yellow-600 rounded-lg font-semibold hover:bg-yellow-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {processingPortal ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Manage Subscription'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Upgrade to Featured CTA - Show if no active subscription */}
        {!subscription && listings.length > 0 && listings.some(l => l.status === 'approved' && !l.is_featured) && (
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-xl font-bold mb-2">Upgrade to Featured Listing</h3>
                <p className="text-yellow-100">
                  Get top placement, verified badge, and enhanced profile for just $29/month
                </p>
              </div>
              <div className="flex gap-2">
                {listings
                  .filter(l => l.status === 'approved' && !l.is_featured)
                  .slice(0, 1)
                  .map(listing => (
                    <button
                      key={listing.id}
                      onClick={() => handleUpgradeToFeatured(listing.id)}
                      disabled={processingListingId === listing.id}
                      className="px-6 py-3 bg-white text-yellow-600 rounded-lg font-semibold hover:bg-yellow-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {processingListingId === listing.id ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Star className="w-5 h-5" />
                          Upgrade Now - $29/month
                        </>
                      )}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Listings */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">My Listings</h2>
              <a
                href="/get-listed"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add New Listing
              </a>
            </div>
          </div>

          <div className="p-6">
            {listings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">You don't have any listings yet.</p>
                <p className="text-sm text-gray-500 mb-6">
                  Create a listing first, then upgrade to featured for $29/month to get top placement and premium features.
                </p>
                <a
                  href="/get-listed"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Your First Listing
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {listings.map(listing => (
                  <div
                    key={listing.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{listing.practice_name}</h3>
                          {getStatusBadge(listing.status)}
                          {listing.is_featured && (
                            <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-2">{listing.profession} • {listing.location}</p>
                        {listing.bio && (
                          <p className="text-gray-700 text-sm mb-3 line-clamp-2">{listing.bio}</p>
                        )}
                        {listing.rejection_reason && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                            <p className="text-sm text-red-800">
                              <strong>Rejection Reason:</strong> {listing.rejection_reason}
                            </p>
                          </div>
                        )}
                        {listing.needs_changes_notes && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                            <p className="text-sm text-blue-800">
                              <strong>Required Changes:</strong> {listing.needs_changes_notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        Edit
                      </button>
                      {listing.status === 'approved' && !listing.is_featured && (
                        <button 
                          onClick={() => handleUpgradeToFeatured(listing.id)}
                          disabled={processingListingId === listing.id}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        >
                          {processingListingId === listing.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Star className="w-4 h-4 mr-2" />
                              Upgrade to Featured - $29/month
                            </>
                          )}
                        </button>
                      )}
                      {listing.status === 'pending' && (
                        <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
                          <p>Once approved, you can upgrade to featured listing</p>
                        </div>
                      )}
                      {listing.status === 'needs_changes' && (
                        <div className="px-4 py-2 bg-orange-50 text-orange-700 rounded-lg text-sm">
                          <p>Please make the required changes to proceed</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-lg shadow-sm mt-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold">Account Settings</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
