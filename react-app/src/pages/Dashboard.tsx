import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { Listing, Subscription } from '../types'
import { CheckCircle, XCircle, Clock, AlertCircle, Star, Loader2, Edit, X, Save, Lock } from 'lucide-react'
import { format } from 'date-fns'
import { useSearchParams } from 'react-router-dom'
import { createCheckoutSession, createPortalSession } from '../lib/stripe'
import { LOCATIONS, PROFESSIONS, SPECIALTIES, PRACTICE_TYPES } from '../lib/constants'
import toast from 'react-hot-toast'

export function Dashboard() {
  const { user } = useAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingListingId, setProcessingListingId] = useState<string | null>(null)
  const [processingPortal, setProcessingPortal] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const [editingListing, setEditingListing] = useState<Listing | null>(null)
  const [editFormData, setEditFormData] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [editingAccount, setEditingAccount] = useState(false)
  const [accountFormData, setAccountFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: ''
  })
  const [updatingAccount, setUpdatingAccount] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null)

  useEffect(() => {
    // Check for error parameters in URL hash (from expired verification links)
    const hash = window.location.hash
    if (hash) {
      const hashParams = new URLSearchParams(hash.substring(1))
      const error = hashParams.get('error')
      const errorCode = hashParams.get('error_code')
      const errorDescription = hashParams.get('error_description')
      
      if (errorCode === 'otp_expired' || error === 'access_denied') {
        const errorMsg = errorDescription 
          ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
          : 'Your verification link has expired. Please request a new one.'
        toast.error(errorMsg, { duration: 6000 })
        // Clean up the hash to prevent showing error again
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
      }
    }

    if (user) {
      fetchData()
      
      // Set up real-time subscription to listen for listing changes
      const channel = supabase
        .channel('listings-changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'listings',
            filter: `user_id=eq.${user.id}`, // Only listen to this user's listings
          },
          (payload) => {
            console.log('Listing change detected:', payload)
            // Refresh data when any change is detected
            fetchData()
            
            // Show toast notification based on change type
            if (payload.eventType === 'UPDATE') {
              const newStatus = payload.new?.status
              const oldStatus = payload.old?.status
              
              if (newStatus !== oldStatus) {
                if (newStatus === 'approved') {
                  toast.success('Your listing has been approved!', { duration: 5000 })
                } else if (newStatus === 'rejected') {
                  toast.error('Your listing has been rejected. Check your email for details.', { duration: 6000 })
                } else if (newStatus === 'needs_changes') {
                  toast('Your listing needs changes. Check your email for details.', { 
                    icon: '⚠️',
                    duration: 6000 
                  })
                }
              }
            }
          }
        )
        .subscribe()

      // Also set up polling as a fallback (refresh every 30 seconds)
      const pollInterval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          fetchData()
        }
      }, 30000) // 30 seconds

      // Refresh when page becomes visible (user switches back to tab)
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          fetchData()
        }
      }
      document.addEventListener('visibilitychange', handleVisibilityChange)

      // Cleanup
      return () => {
        supabase.removeChannel(channel)
        clearInterval(pollInterval)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
  }, [user])

  // Check email verification status
  useEffect(() => {
    const checkEmailVerification = async () => {
      if (!user?.id) {
        setEmailVerified(null)
        return
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('email_verified')
          .eq('id', user.id)
          .maybeSingle()

        if (error) {
          console.error('Error checking email verification:', error)
          // Fallback: check if user exists, if not, default to false (unverified)
          setEmailVerified(false)
        } else if (data) {
          // Use the email_verified value from users table
          setEmailVerified(data.email_verified === true)
        } else {
          // User record doesn't exist yet, default to false (unverified)
          setEmailVerified(false)
        }
      } catch (err) {
        console.error('Error checking email verification:', err)
        // On error, default to false (unverified)
        setEmailVerified(false)
      }
    }

    checkEmailVerification()
  }, [user])

  // Check if we just verified email (from URL param)
  useEffect(() => {
    const verified = searchParams.get('verified')
    if (verified === 'true') {
      // Refresh email verification status
      if (user?.id) {
        supabase
          .from('users')
          .select('email_verified')
          .eq('id', user.id)
          .maybeSingle()
          .then(({ data }) => {
            setEmailVerified(data?.email_verified || false)
          })
      }
      // Remove the param from URL
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, user, setSearchParams])

  // Check for success/cancel messages from Stripe redirect
  useEffect(() => {
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')
    
    if (success === 'true') {
      // Refresh data to show updated subscription
      fetchData()
      // Remove query param
      setSearchParams({})
      toast.success('Payment successful! Your listing is now featured.')
    } else if (canceled === 'true') {
      setSearchParams({})
      toast.error('Payment was canceled.')
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

      // Fetch subscription (don't use .single() as it fails with 406 if no results)
      if (listingsData && listingsData.length > 0) {
        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user?.id)
          .eq('status', 'active')
          .limit(1)
          .maybeSingle()

        if (!subError && subData) {
          setSubscription(subData)
        }
      }

      // Fetch user profile
      if (user?.id) {
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (!profileError && profileData) {
          setUserProfile(profileData)
          setAccountFormData({
            email: user.email || '',
            first_name: profileData.first_name || '',
            last_name: profileData.last_name || '',
            phone: profileData.phone || ''
          })
        } else {
          // Initialize with user email if no profile exists
          setAccountFormData({
            email: user.email || '',
            first_name: '',
            last_name: '',
            phone: ''
          })
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateAccount = async () => {
    if (!user?.id) return
    
    setUpdatingAccount(true)
    try {
      const emailChanged = accountFormData.email !== user.email
      
      // Update email if changed (requires verification)
      if (emailChanged) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: accountFormData.email
        })
        if (emailError) throw emailError
        toast.success('Email update initiated. Please check your new email for verification.')
      }
      
      // Update or create user profile
      if (userProfile) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({
            first_name: accountFormData.first_name || null,
            last_name: accountFormData.last_name || null,
            phone: accountFormData.phone || null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
        
        if (profileError) throw profileError
      } else {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            first_name: accountFormData.first_name || null,
            last_name: accountFormData.last_name || null,
            phone: accountFormData.phone || null
          })
        
        if (profileError) throw profileError
      }
      
      // Update users table email if changed
      if (emailChanged) {
        const { error: userError } = await supabase
          .from('users')
          .update({ email: accountFormData.email })
          .eq('id', user.id)
        
        if (userError) throw userError
      }
      
      await fetchData()
      setEditingAccount(false)
      toast.success('Account updated successfully!')
    } catch (error: any) {
      console.error('Error updating account:', error)
      toast.error(error.message || 'Failed to update account. Please try again.')
    } finally {
      setUpdatingAccount(false)
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
      toast.error(error.message || 'Failed to start checkout. Please try again.')
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
      toast.error(error.message || 'Failed to open customer portal. Please try again.')
      setProcessingPortal(false)
    }
  }

  const handleChangePassword = async () => {
    if (!user?.email) {
      toast.error('Email address not found')
      return
    }

    setPasswordLoading(true)
    try {
      // Use our custom password reset Edge Function via Supabase client
      // Always use production URL for password reset links (not localhost)
      const appUrl = import.meta.env.VITE_APP_URL || 'https://www.tasmentalhealthdirectory.com.au'
      const redirectUrl = window.location.hostname === 'localhost' 
        ? `${appUrl}/reset-password`
        : `${window.location.origin}/reset-password`
      
      const { data, error } = await supabase.functions.invoke('password-reset', {
        body: {
          email: user.email,
          redirectUrl: redirectUrl,
        },
      })

      if (error) {
        console.error('Password reset function error:', error)
        throw new Error(error.message || 'Failed to send password reset email')
      }

      console.log('Password reset email sent:', data)

      toast.success('Password reset email sent! Please check your inbox and click the link to change your password.')
      setShowPasswordModal(false)
    } catch (error: any) {
      console.error('Error sending password reset email:', error)
      toast.error(error.message || 'Failed to send password reset email. Please try again.')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleEditListing = (listing: Listing) => {
    setEditingListing(listing)
    setEditFormData({
      practice_name: listing.practice_name,
      email: listing.email,
      phone: listing.phone,
      website: listing.website || '',
      profession: listing.profession,
      practice_type: listing.practice_type,
      ahpra_number: listing.ahpra_number || '',
      specialties: [...listing.specialties],
      location: listing.location,
      postcode: listing.postcode,
      street_address: listing.street_address || '',
      is_telehealth: listing.is_telehealth,
      is_rural_outreach: listing.is_rural_outreach,
      is_statewide_telehealth: listing.is_statewide_telehealth,
      bio: listing.bio || '',
      avatar_url: listing.avatar_url || '',
      show_name_publicly: listing.show_name_publicly,
      show_email_publicly: listing.show_email_publicly,
      show_phone_publicly: listing.show_phone_publicly,
      show_website_publicly: listing.show_website_publicly,
    })
    setAvatarPreview(listing.avatar_url || null)
  }

  const handleSaveEdit = async () => {
    if (!editingListing || !editFormData) return

    setSaving(true)
    try {
      // Exclude avatar_url from update (column doesn't exist in database)
      const { avatar_url, ...updateData } = editFormData
      
      const { error } = await supabase
        .from('listings')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingListing.id)

      if (error) throw error

      await fetchData()
      setEditingListing(null)
      setEditFormData(null)
      toast.success('Listing updated successfully!')
    } catch (error: any) {
      console.error('Error updating listing:', error)
      toast.error(`Failed to update listing: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const toggleSpecialty = (specialty: string) => {
    if (!editFormData) return
    const current = editFormData.specialties || []
    if (current.includes(specialty)) {
      setEditFormData({
        ...editFormData,
        specialties: current.filter((s: string) => s !== specialty),
      })
    } else {
      setEditFormData({
        ...editFormData,
        specialties: [...current, specialty],
      })
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setUploadingAvatar(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id || 'temp'}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('listings')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('listings')
        .getPublicUrl(filePath)

      setEditFormData((prev: any) => ({ ...prev, avatar_url: publicUrl }))
    } catch (err: any) {
      console.error('Error uploading avatar:', err)
      toast.error(err.message || 'Failed to upload avatar')
      setAvatarPreview(null)
    } finally {
      setUploadingAvatar(false)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/20 to-gray-100 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-300 rounded-full blur-3xl"></div>
      </div>
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2339B8A6' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="py-12 px-4 relative z-10">
        <div className="container mx-auto max-w-6xl">
          {/* Email Verification Warning */}
          {user && emailVerified === false && (
            <div className="mb-6 bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                <div>
                  <p className="font-semibold text-yellow-800">Email Verification Required</p>
                  <p className="text-sm text-yellow-700">Please verify your email address to access all features.</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  try {
                    console.log('Sending verification email to:', user.email)
                    // Always use our custom Edge Function for reliable email delivery
                    const { data, error: functionError } = await supabase.functions.invoke('send-verification-email', {
                      body: { email: user.email || '' }
                    })
                    
                    if (functionError) {
                      console.error('Edge Function error:', functionError)
                      // Fallback: Try Supabase's built-in resend
                      const { error: resendError } = await supabase.auth.resend({
                        type: 'signup',
                        email: user.email || ''
                      })
                      
                      if (resendError) {
                        throw new Error(resendError.message || 'Failed to send verification email')
                      } else {
                        toast.success('Verification email sent! Check your inbox.')
                      }
                    } else {
                      console.log('Verification email sent successfully:', data)
                      toast.success('Verification email sent! Check your inbox.')
                    }
                  } catch (error: any) {
                    console.error('Error sending verification email:', error)
                    toast.error(error.message || 'Failed to send verification email. Please try again.')
                  }
                }}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-semibold"
              >
                Resend Email
              </button>
            </div>
          )}
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-gray-900">My Dashboard</h1>
            <p className="text-gray-600 text-lg">Manage your listings and subscription</p>
          </div>

          {/* Subscription Status */}
          {subscription && (
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-2xl p-6 mb-8 shadow-xl border-2 border-yellow-300">
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
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-2xl p-6 mb-8 shadow-xl border-2 border-yellow-300">
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
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">My Listings</h2>
                <a
                  href="/get-listed"
                  className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-md hover:shadow-lg font-semibold"
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
                  className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold"
                >
                  Create Your First Listing
                </a>
              </div>
            ) : (
              <div className="space-y-4 p-6">
                {listings.map(listing => (
                  <div
                    key={listing.id}
                    className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all bg-gradient-to-br from-white to-gray-50/50 hover:border-primary-300"
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
                      <button 
                        onClick={() => handleEditListing(listing)}
                        className="px-4 py-2 bg-primary-100 text-primary-700 rounded-xl hover:bg-primary-200 transition-all font-semibold flex items-center gap-2 shadow-sm hover:shadow-md"
                      >
                        <Edit className="w-4 h-4" />
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
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 mt-8 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
              {!editingAccount && (
                <button
                  onClick={() => setEditingAccount(true)}
                  className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-semibold flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Account
                </button>
              )}
            </div>
            <div className="p-6">
              {editingAccount ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={accountFormData.email}
                      onChange={(e) => setAccountFormData({ ...accountFormData, email: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Changing email will require verification</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={accountFormData.first_name}
                        onChange={(e) => setAccountFormData({ ...accountFormData, first_name: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={accountFormData.last_name}
                        onChange={(e) => setAccountFormData({ ...accountFormData, last_name: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={accountFormData.phone}
                      onChange={(e) => setAccountFormData({ ...accountFormData, phone: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleUpdateAccount}
                      disabled={updatingAccount}
                      className="px-6 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {updatingAccount ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditingAccount(false)
                        // Reset form data
                        if (userProfile) {
                          setAccountFormData({
                            email: user?.email || '',
                            first_name: userProfile.first_name || '',
                            last_name: userProfile.last_name || '',
                            phone: userProfile.phone || ''
                          })
                        } else {
                          setAccountFormData({
                            email: user?.email || '',
                            first_name: '',
                            last_name: '',
                            phone: ''
                          })
                        }
                      }}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl bg-gray-50"
                    />
                    {user && emailVerified ? (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Email verified
                      </p>
                    ) : (
                      <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Email verification pending
                      </p>
                    )}
                  </div>
                  {(accountFormData.first_name || accountFormData.last_name || accountFormData.phone) && (
                    <>
                      {(accountFormData.first_name || accountFormData.last_name) && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                          <input
                            type="text"
                            value={`${accountFormData.first_name} ${accountFormData.last_name}`.trim()}
                            disabled
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl bg-gray-50"
                          />
                        </div>
                      )}
                      {accountFormData.phone && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                          <input
                            type="tel"
                            value={accountFormData.phone}
                            disabled
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl bg-gray-50"
                          />
                        </div>
                      )}
                    </>
                  )}
                  <div>
                    <button 
                      onClick={() => setShowPasswordModal(true)}
                      className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-semibold"
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingListing && editFormData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold">Edit Listing</h2>
              <button
                onClick={() => {
                  setEditingListing(null)
                  setEditFormData(null)
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Practice Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Practice Name *</label>
                <input
                  type="text"
                  value={editFormData.practice_name}
                  onChange={(e) => setEditFormData({ ...editFormData, practice_name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  required
                />
              </div>

              {/* Email and Phone */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  value={editFormData.website}
                  onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  placeholder="https://example.com"
                />
              </div>

              {/* Profession and Practice Type */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Profession *</label>
                  <select
                    value={editFormData.profession}
                    onChange={(e) => setEditFormData({ ...editFormData, profession: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                    required
                  >
                    <option value="">Select profession</option>
                    {PROFESSIONS.map(prof => (
                      <option key={prof} value={prof}>{prof}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Practice Type *</label>
                  <select
                    value={editFormData.practice_type}
                    onChange={(e) => setEditFormData({ ...editFormData, practice_type: e.target.value as any })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                    required
                  >
                    {PRACTICE_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location and Postcode */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
                  <select
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                    required
                  >
                    <option value="">Select location</option>
                    {LOCATIONS.filter(loc => loc !== 'All Locations' && loc !== 'Statewide (Telehealth)' && loc !== 'Telehealth').map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Postcode *</label>
                  <input
                    type="text"
                    value={editFormData.postcode}
                    onChange={(e) => setEditFormData({ ...editFormData, postcode: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Street Address</label>
                <input
                  type="text"
                  value={editFormData.street_address}
                  onChange={(e) => setEditFormData({ ...editFormData, street_address: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                />
              </div>

              {/* Specialties */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Specialties</label>
                <div className="border-2 border-gray-200 rounded-xl p-4 max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {SPECIALTIES.map(specialty => (
                      <label key={specialty} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editFormData.specialties?.includes(specialty) || false}
                          onChange={() => toggleSpecialty(specialty)}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{specialty}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                <textarea
                  value={editFormData.bio}
                  onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all resize-none"
                  placeholder="Tell us about your practice..."
                />
              </div>

              {/* Avatar Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Practice Logo/Avatar <span className="text-xs text-gray-500">(Only shown for featured listings)</span>
                </label>
                <div className="space-y-3">
                  {avatarPreview && (
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-primary-200">
                      <img 
                        src={avatarPreview} 
                        alt="Avatar preview" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarPreview(null)
                          setEditFormData((prev: any) => ({ ...prev, avatar_url: '' }))
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <span className="text-xs">×</span>
                      </button>
                    </div>
                  )}
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      disabled={uploadingAvatar}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    />
                    {uploadingAvatar && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Upload a square image (recommended: 400x400px). Max size: 5MB. Only featured listings will display this avatar.
                  </p>
                </div>
              </div>

              {/* Telehealth Options */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Services</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editFormData.is_telehealth}
                      onChange={(e) => setEditFormData({ ...editFormData, is_telehealth: e.target.checked })}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Telehealth Available</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editFormData.is_statewide_telehealth}
                      onChange={(e) => setEditFormData({ ...editFormData, is_statewide_telehealth: e.target.checked })}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Statewide Telehealth</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editFormData.is_rural_outreach}
                      onChange={(e) => setEditFormData({ ...editFormData, is_rural_outreach: e.target.checked })}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Rural Outreach</span>
                  </label>
                </div>
              </div>

              {/* Public Visibility Settings */}
              <div className="border-t border-gray-200 pt-4">
                <label className="text-lg font-bold text-gray-900 mb-3 block">Public Visibility Settings</label>
                <p className="text-sm text-gray-600 mb-4">
                  Choose which contact details you want to be publicly visible on your listing.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-primary-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={editFormData.show_name_publicly}
                      onChange={(e) => setEditFormData({ ...editFormData, show_name_publicly: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Show Name Publicly</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-primary-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={editFormData.show_email_publicly}
                      onChange={(e) => setEditFormData({ ...editFormData, show_email_publicly: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Show Email Publicly</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-primary-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={editFormData.show_phone_publicly}
                      onChange={(e) => setEditFormData({ ...editFormData, show_phone_publicly: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Show Phone Publicly</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-primary-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={editFormData.show_website_publicly}
                      onChange={(e) => setEditFormData({ ...editFormData, show_website_publicly: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Show Website Publicly</span>
                  </label>
                </div>
              </div>

              {/* Save/Cancel Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setEditingListing(null)
                    setEditFormData(null)
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Lock className="w-6 h-6 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                We'll send you a secure link to your email address ({user?.email}) to change your password. 
                Click the link in the email to set a new password.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleChangePassword}
                  disabled={passwordLoading}
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {passwordLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Send Reset Link
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  disabled={passwordLoading}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
