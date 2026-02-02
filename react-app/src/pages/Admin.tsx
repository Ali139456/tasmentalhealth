import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { Listing, User } from '../types'
import { CheckCircle, XCircle, Clock, AlertCircle, Search, Mail, Phone, ChevronLeft, ChevronRight, Trash2, Loader2, FileText, X, Plus, Edit, FileSpreadsheet, Palette, Type, Globe, BarChart3, TrendingUp, Users, Filter, MousePointer, ExternalLink, Calendar, MapPin, Tag, User as UserIcon, Star, Key, Shield, RefreshCw, Save } from 'lucide-react'
import { format } from 'date-fns'
import { sendEmail, getEmailTemplate } from '../lib/email'
import toast from 'react-hot-toast'
import { LOCATIONS, PROFESSIONS, SPECIALTIES, PRACTICE_TYPES } from '../lib/constants'

const ITEMS_PER_PAGE = 10

export function Admin() {
  const { user, role } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [listings, setListings] = useState<Listing[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Get active tab from URL, default to 'listings'
  const tabFromUrl = searchParams.get('tab') as 'listings' | 'users' | 'subscriptions' | 'articles' | 'content' | 'analytics' | 'events' | 'mailinglist' | null
  const validTabs = ['listings', 'users', 'subscriptions', 'articles', 'content', 'analytics', 'events', 'mailinglist']
  const initialTab = (tabFromUrl && validTabs.includes(tabFromUrl)) ? tabFromUrl : 'listings'
  const [activeTab, setActiveTab] = useState<'listings' | 'users' | 'subscriptions' | 'articles' | 'content' | 'analytics' | 'events' | 'mailinglist'>(initialTab)
  
  // Update URL when tab changes
  const handleTabChange = (tab: 'listings' | 'users' | 'subscriptions' | 'articles' | 'content' | 'analytics' | 'events' | 'mailinglist') => {
    setActiveTab(tab)
    setSearchParams({ tab }, { replace: true })
  }
  const [articles, setArticles] = useState<any[]>([])
  const [counts, setCounts] = useState({ listings: 0, users: 0, articles: 0, events: 0, mailinglist: 0 })
  const [mailingList, setMailingList] = useState<any[]>([])
  const [mailingListSearch, setMailingListSearch] = useState('')
  const [currentMailingListPage, setCurrentMailingListPage] = useState(1)
  const [showArticleForm, setShowArticleForm] = useState(false)
  const [articleFormData, setArticleFormData] = useState({
    title: '',
    slug: '',
    category: '',
    content: '',
    excerpt: '',
    image_url: '',
    tags: [] as string[],
    read_time: 0,
    published: false
  })
  const [tagInput, setTagInput] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [savingArticle, setSavingArticle] = useState(false)
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null)
  const [customCategory, setCustomCategory] = useState('')
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editingRole, setEditingRole] = useState<'admin' | 'lister' | 'public'>('lister')
  const [editingUserEmail, setEditingUserEmail] = useState('')
  const [editingUserVerified, setEditingUserVerified] = useState(false)
  const [updatingUser, setUpdatingUser] = useState(false)
  const [currentListingsPage, setCurrentListingsPage] = useState(1)
  const [currentUsersPage, setCurrentUsersPage] = useState(1)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [editingListingId, setEditingListingId] = useState<string | null>(null)
  const [listingFormData, setListingFormData] = useState<any>(null)
  const [savingListing, setSavingListing] = useState(false)
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false)
  const [passwordResetUserId, setPasswordResetUserId] = useState<string | null>(null)
  const [passwordResetEmail, setPasswordResetEmail] = useState('')
  const [resettingPassword, setResettingPassword] = useState(false)
  const [eventFormData, setEventFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_end_date: '',
    location: '',
    location_address: '',
    event_type: 'workshop' as 'workshop' | 'seminar' | 'support_group' | 'conference' | 'training' | 'other',
    organizer_name: '',
    organizer_email: '',
    organizer_phone: '',
    registration_url: '',
    image_url: '',
    is_published: false,
    max_attendees: '',
    cost: '',
    tags: [] as string[]
  })
  const [eventTagInput, setEventTagInput] = useState('')
  const [savingEvent, setSavingEvent] = useState(false)

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showEventForm) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showEventForm])
  
  // Analytics state
  const [analyticsData, setAnalyticsData] = useState({
    topPages: [] as Array<{ page_path: string; views: number; display_name: string }>,
    topSearches: [] as Array<{ query: string; searches: number }>,
    topFilters: [] as Array<{ filter_type: string; filter_value: string; uses: number }>,
    topReferrers: [] as Array<{ referrer: string; visits: number }>,
    topListings: [] as Array<{ listing_id: string; listing_name: string; clicks: number }>,
    topLinks: [] as Array<{ url: string; link_text: string; clicks: number }>,
    avgTimeOnPage: [] as Array<{ page_path: string; avg_seconds: number; display_name: string }>
  })
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  // Sync activeTab with URL on mount and when URL changes
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as 'listings' | 'users' | 'subscriptions' | 'articles' | 'content' | 'analytics' | 'events' | null
    const validTabs = ['listings', 'users', 'subscriptions', 'articles', 'content', 'analytics', 'events']
    if (tabFromUrl && validTabs.includes(tabFromUrl) && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl)
    }
  }, [searchParams, activeTab])

  useEffect(() => {
    if (user && role === 'admin') {
      fetchCounts()
      fetchData()
    } else if (user && role !== 'admin') {
      setLoading(false)
    }
  }, [user, role])

  useEffect(() => {
    if (user && role === 'admin') {
      if (activeTab === 'analytics') {
        fetchAnalytics()
      } else if (activeTab === 'mailinglist') {
        fetchMailingList()
      } else {
        fetchData()
      }
    }
  }, [activeTab, user, role])

  // Fetch counts for all tabs on initial load
  const fetchMailingList = async () => {
    try {
      const { data, error } = await supabase
        .from('event_subscriptions')
        .select('*')
        .order('subscribed_at', { ascending: false })

      if (error) throw error
      setMailingList(data || [])
    } catch (error: any) {
      console.error('Error fetching mailing list:', error)
      toast.error(`Failed to fetch mailing list: ${error.message}`)
    }
  }

  const handleExportMailingList = () => {
    try {
      // Filter based on search if needed
      const filtered = mailingListSearch
        ? mailingList.filter(sub => 
            sub.email.toLowerCase().includes(mailingListSearch.toLowerCase())
          )
        : mailingList

      // Create CSV content
      const headers = ['Email', 'Subscribed At', 'Status', 'Unsubscribed At']
      const rows = filtered.map(sub => [
        sub.email,
        format(new Date(sub.subscribed_at), 'yyyy-MM-dd HH:mm:ss'),
        sub.is_active ? 'Active' : 'Inactive',
        sub.unsubscribed_at ? format(new Date(sub.unsubscribed_at), 'yyyy-MM-dd HH:mm:ss') : ''
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `mailing-list-${format(new Date(), 'yyyy-MM-dd')}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success(`Exported ${filtered.length} subscribers to CSV`)
    } catch (error: any) {
      console.error('Error exporting mailing list:', error)
      toast.error(`Failed to export: ${error.message}`)
    }
  }

  const fetchCounts = async () => {
    try {
      const [listingsResult, usersResult, articlesResult, eventsResult, mailingListResult] = await Promise.all([
        supabase.from('listings').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('resources').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('event_subscriptions').select('id', { count: 'exact', head: true })
      ])

      setCounts({
        listings: listingsResult.count ?? 0,
        users: usersResult.count ?? 0,
        articles: articlesResult.count ?? 0,
        events: eventsResult.count ?? 0,
        mailinglist: mailingListResult.count ?? 0
      })
    } catch (error) {
      console.error('Error fetching counts:', error)
      // Fallback: if count query fails, use length of fetched data
      setCounts({
        listings: listings.length,
        users: users.length,
        articles: articles.length,
        events: events.length,
        mailinglist: mailingList.length
      })
    }
  }

  // Helper function to format page paths into readable names
  const formatPagePath = (path: string): string => {
    const pathMap: Record<string, string> = {
      '/': 'Home',
      '/resources': 'Resources',
      '/events': 'Events',
      '/crisis-support': 'Crisis Support',
      '/get-listed': 'Get Listed',
      '/dashboard': 'Dashboard',
      '/admin': 'Admin',
      '/login': 'Login',
      '/admin-login': 'Admin Login',
      '/featured-listings': 'Featured Listings',
      '/privacy-policy': 'Privacy Policy',
      '/terms-of-service': 'Terms of Service',
      '/sitemap': 'Sitemap',
      '/reset-password': 'Reset Password',
      '/verify-email': 'Verify Email'
    }
    
    // Check if it's a listing detail page
    if (path.startsWith('/listing/')) {
      return `Listing Detail (${path.split('/')[2]?.substring(0, 8)}...)`
    }
    
    // Check if it's a resource detail page
    if (path.startsWith('/resources/')) {
      return `Resource Detail (${path.split('/')[2]?.substring(0, 8)}...)`
    }
    
    // Return mapped name or formatted path
    return pathMap[path] || path.charAt(1).toUpperCase() + path.slice(2).replace(/-/g, ' ') || path
  }

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true)
      
      // Check if table exists first
      const { data: pagesData, error: pagesError } = await supabase
        .from('analytics_events')
        .select('page_path')
        .eq('event_type', 'page_view')
        .limit(1)
      
      if (pagesError) {
        console.error('Analytics table error:', pagesError)
        toast.error('Analytics table not found. Please run the SQL script to create it.')
        setAnalyticsLoading(false)
        return
      }
      
      // Top pages by views
      const { data: allPagesData } = await supabase
        .from('analytics_events')
        .select('page_path')
        .eq('event_type', 'page_view')
      
      const pageViews: Record<string, number> = {}
      allPagesData?.forEach(item => {
        pageViews[item.page_path] = (pageViews[item.page_path] || 0) + 1
      })
      const topPages = Object.entries(pageViews)
        .map(([page_path, views]) => ({ page_path, views, display_name: formatPagePath(page_path) }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10)
      
      // Top search queries
      const { data: searchData } = await supabase
        .from('analytics_events')
        .select('event_data')
        .eq('event_type', 'search')
      
      const searches: Record<string, number> = {}
      searchData?.forEach(item => {
        const query = item.event_data?.query
        if (query) {
          searches[query] = (searches[query] || 0) + 1
        }
      })
      const topSearches = Object.entries(searches)
        .map(([query, searches]) => ({ query, searches }))
        .sort((a, b) => b.searches - a.searches)
        .slice(0, 20)
      
      // Top filters
      const { data: filterData } = await supabase
        .from('analytics_events')
        .select('event_data')
        .eq('event_type', 'filter')
      
      const filters: Record<string, number> = {}
      filterData?.forEach(item => {
        const filterType = item.event_data?.filter_type
        const filterValue = item.event_data?.filter_value
        if (filterType && filterValue) {
          const key = `${filterType}:${filterValue}`
          filters[key] = (filters[key] || 0) + 1
        }
      })
      const topFilters = Object.entries(filters)
        .map(([key, uses]) => {
          const [filter_type, filter_value] = key.split(':')
          return { filter_type, filter_value, uses }
        })
        .sort((a, b) => b.uses - a.uses)
        .slice(0, 20)
      
      // Top referrers
      const { data: referrerData } = await supabase
        .from('analytics_events')
        .select('referrer')
        .eq('event_type', 'page_view')
        .not('referrer', 'is', null)
      
      const referrers: Record<string, number> = {}
      referrerData?.forEach(item => {
        if (item.referrer) {
          referrers[item.referrer] = (referrers[item.referrer] || 0) + 1
        }
      })
      const topReferrers = Object.entries(referrers)
        .map(([referrer, visits]) => ({ referrer, visits }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 20)
      
      // Top listing clicks
      const { data: listingClickData } = await supabase
        .from('analytics_events')
        .select('event_data')
        .eq('event_type', 'listing_click')
      
      const listingClicks: Record<string, { name: string; clicks: number }> = {}
      listingClickData?.forEach(item => {
        const listingId = item.event_data?.listing_id
        const listingName = item.event_data?.listing_name
        if (listingId) {
          if (!listingClicks[listingId]) {
            listingClicks[listingId] = { name: listingName || 'Unknown', clicks: 0 }
          }
          listingClicks[listingId].clicks++
        }
      })
      const topListings = Object.entries(listingClicks)
        .map(([listing_id, data]) => ({ listing_id, listing_name: data.name, clicks: data.clicks }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 20)
      
      // Top link clicks
      const { data: linkClickData } = await supabase
        .from('analytics_events')
        .select('event_data')
        .eq('event_type', 'link_click')
      
      const linkClicks: Record<string, { text: string; clicks: number }> = {}
      linkClickData?.forEach(item => {
        const url = item.event_data?.url
        const linkText = item.event_data?.link_text
        if (url) {
          if (!linkClicks[url]) {
            linkClicks[url] = { text: linkText || url, clicks: 0 }
          }
          linkClicks[url].clicks++
        }
      })
      const topLinks = Object.entries(linkClicks)
        .map(([url, data]) => ({ url, link_text: data.text, clicks: data.clicks }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 20)
      
      // Average time on page
      const { data: timeData } = await supabase
        .from('analytics_events')
        .select('page_path, event_data')
        .eq('event_type', 'time_on_page')
      
      const timeByPage: Record<string, { total: number; count: number }> = {}
      timeData?.forEach(item => {
        const duration = parseFloat(item.event_data?.duration || '0')
        if (duration > 0) {
          if (!timeByPage[item.page_path]) {
            timeByPage[item.page_path] = { total: 0, count: 0 }
          }
          timeByPage[item.page_path].total += duration
          timeByPage[item.page_path].count++
        }
      })
      const avgTimeOnPage = Object.entries(timeByPage)
        .map(([page_path, data]) => ({
          page_path,
          display_name: formatPagePath(page_path),
          avg_seconds: Math.round(data.total / data.count)
        }))
        .sort((a, b) => b.avg_seconds - a.avg_seconds)
        .slice(0, 10)
      
      setAnalyticsData({
        topPages,
        topSearches,
        topFilters,
        topReferrers,
        topListings,
        topLinks,
        avgTimeOnPage
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      if (activeTab === 'listings') {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setListings(data || [])
        // Update count
        setCounts(prev => ({ ...prev, listings: data?.length || 0 }))
      } else if (activeTab === 'users') {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setUsers(data || [])
        // Update count
        setCounts(prev => ({ ...prev, users: data?.length || 0 }))
      } else if (activeTab === 'articles') {
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setArticles(data || [])
        // Update count
        setCounts(prev => ({ ...prev, articles: data?.length || 0 }))
      } else if (activeTab === 'events') {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('event_date', { ascending: true })

        if (error) throw error
        setEvents(data || [])
        // Update count
        setCounts(prev => ({ ...prev, events: data?.length || 0 }))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFeatured = async (listingId: string, isFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ is_featured: isFeatured })
        .eq('id', listingId)

      if (error) throw error

      await fetchData()
      toast.success(isFeatured ? 'Listing set as Featured' : 'Featured status removed')
    } catch (error: any) {
      console.error('Error toggling featured status:', error)
      toast.error(`Failed to update featured status: ${error.message}`)
    }
  }

  const handleEditListing = (listing: Listing) => {
    setEditingListingId(listing.id)
    setListingFormData({
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
  }

  const handleSaveListing = async () => {
    if (!editingListingId || !listingFormData) return

    setSavingListing(true)
    try {
      const { error } = await supabase
        .from('listings')
        .update({
          ...listingFormData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingListingId)

      if (error) throw error

      await fetchData()
      setEditingListingId(null)
      setListingFormData(null)
      toast.success('Listing updated successfully!')
    } catch (error: any) {
      console.error('Error updating listing:', error)
      toast.error(`Failed to update listing: ${error.message}`)
    } finally {
      setSavingListing(false)
    }
  }

  const handleResetPassword = async (userId: string, userEmail: string) => {
    setPasswordResetUserId(userId)
    setPasswordResetEmail(userEmail)
    setShowPasswordResetModal(true)
  }

  const handleConfirmPasswordReset = async () => {
    if (!passwordResetEmail) return

    setResettingPassword(true)
    try {
      // Use Supabase Admin API via Edge Function to reset password
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('Not authenticated')
      }

      const functionUrl = `${supabaseUrl}/functions/v1/password-reset`

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({ 
          email: passwordResetEmail,
          redirectUrl: `${window.location.origin}/reset-password`
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to reset password')
      }

      toast.success('Password reset email sent successfully!')
      setShowPasswordResetModal(false)
      setPasswordResetUserId(null)
      setPasswordResetEmail('')
    } catch (error: any) {
      console.error('Error resetting password:', error)
      toast.error(`Failed to reset password: ${error.message}`)
    } finally {
      setResettingPassword(false)
    }
  }

  const handleResendVerification = async (userId: string, userEmail: string) => {
    try {
      // Use Supabase Admin API via Edge Function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('Not authenticated')
      }

      const functionUrl = `${supabaseUrl}/functions/v1/send-verification-email`

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({ 
          email: userEmail,
          redirectTo: `${window.location.origin}/dashboard`
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to send verification email')
      }

      toast.success('Verification email sent successfully!')
    } catch (error: any) {
      console.error('Error resending verification:', error)
      toast.error(`Failed to send verification email: ${error.message}`)
    }
  }

  const handleListingAction = async (listingId: string, action: 'approve' | 'reject' | 'needs_changes', notes?: string) => {
    try {
      const status = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'needs_changes'
      const updateData: any = { status }

      if (action === 'reject' && notes) {
        updateData.rejection_reason = notes
      }
      if (action === 'needs_changes' && notes) {
        updateData.needs_changes_notes = notes
      }

      const { error } = await supabase
        .from('listings')
        .update(updateData)
        .eq('id', listingId)

      if (error) throw error

      // Get listing and user info for email
      const listing = listings.find(l => l.id === listingId)
      if (listing) {
        const { data: userData } = await supabase
          .from('users')
          .select('email')
          .eq('id', listing.user_id)
          .single()

        if (userData) {
          // Send email notification
          const templateType = action === 'approve' ? 'listing_approved' : action === 'reject' ? 'listing_rejected' : 'listing_needs_changes'
          const template = getEmailTemplate(templateType, {
            email: userData.email,
            userName: userData.email.split('@')[0],
            listingName: listing.practice_name,
            reason: notes,
            notes: notes,
            dashboardUrl: `${window.location.origin}/dashboard`,
            appUrl: window.location.origin
          })

          await sendEmail({
            to: userData.email,
            subject: template.subject,
            html: template.html
          })
        }
      }

      await fetchData()
      await fetchCounts()
      toast.success(`Listing ${action}d successfully!`)
    } catch (error: any) {
      console.error('Error updating listing:', error)
      toast.error(`Failed to ${action} listing: ${error.message}`)
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

  const filteredListings = listings.filter(listing =>
    listing.practice_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(userSearchQuery.toLowerCase())
  )

  // Pagination calculations
  const totalListingsPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE)
  const totalUsersPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
  
  const paginatedListings = filteredListings.slice(
    (currentListingsPage - 1) * ITEMS_PER_PAGE,
    currentListingsPage * ITEMS_PER_PAGE
  )
  
  const paginatedUsers = filteredUsers.slice(
    (currentUsersPage - 1) * ITEMS_PER_PAGE,
    currentUsersPage * ITEMS_PER_PAGE
  )

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentListingsPage(1)
  }, [searchQuery])

  useEffect(() => {
    setCurrentUsersPage(1)
  }, [userSearchQuery])

  // Reset to page 1 when tab changes
  useEffect(() => {
    setCurrentListingsPage(1)
    setCurrentUsersPage(1)
  }, [activeTab])

  const handleStartEditUser = (userItem: User) => {
    setEditingUserId(userItem.id)
    setEditingRole(userItem.role as 'admin' | 'lister' | 'public')
    setEditingUserEmail(userItem.email)
    setEditingUserVerified(userItem.email_verified || false)
  }

  const handleCancelEditUser = () => {
    setEditingUserId(null)
    setEditingRole('lister')
    setEditingUserEmail('')
    setEditingUserVerified(false)
  }

  const handleUpdateUser = async (userId: string) => {
    setUpdatingUser(true)
    try {
      const userItem = users.find(u => u.id === userId)
      if (!userItem) throw new Error('User not found')

      const updates: any = {
        role: editingRole,
        email_verified: editingUserVerified
      }

      // Update email if changed
      if (editingUserEmail !== userItem.email) {
        updates.email = editingUserEmail
        // Also update auth.users email via admin API (would need Edge Function for this)
        // For now, we'll update the users table and note that auth email needs manual update
        toast('Email updated in database. Note: Auth email update requires admin privileges.', { duration: 5000 })
      }

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)

      if (error) throw error

      await fetchData()
      await fetchCounts()
      handleCancelEditUser()
      toast.success('User updated successfully!')
    } catch (error: any) {
      console.error('Error updating user:', error)
      toast.error(`Failed to update user: ${error.message}`)
    } finally {
      setUpdatingUser(false)
    }
  }

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  // Calculate read time from content (average reading speed: 200 words per minute)
  const calculateReadTime = (content: string) => {
    const words = content.trim().split(/\s+/).length
    return Math.max(1, Math.ceil(words / 200))
  }

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // SECURITY: Validate file type - only allow specific image MIME types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)')
      return
    }

    // SECURITY: Validate file extension matches MIME type
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    if (!fileExt || !validExtensions.includes(fileExt)) {
      toast.error('Invalid file extension. Please upload a valid image file.')
      return
    }

    // SECURITY: Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    // SECURITY: Validate minimum file size (prevent empty or corrupted files)
    if (file.size < 100) {
      toast.error('File appears to be corrupted or empty')
      return
    }

    setUploadingImage(true)
    try {
      // SECURITY: Sanitize filename
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      // Sanitize filename: remove any path separators and special characters
      const sanitizedFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`.replace(/[^a-zA-Z0-9._-]/g, '')
      const filePath = `articles/${sanitizedFileName}`

      // Try 'Articles' bucket first (case-sensitive), fallback to 'listings' if it doesn't exist
      let bucketName = 'Articles'
      let uploadError = null

      const { error: articlesError } = await supabase.storage
        .from('Articles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (articlesError) {
        // If Articles bucket doesn't exist, try listings bucket
        if (articlesError.message?.includes('not found') || articlesError.message?.includes('Bucket')) {
          bucketName = 'listings'
          const { error: listingsError } = await supabase.storage
            .from('listings')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            })
          uploadError = listingsError
        } else {
          uploadError = articlesError
        }
      }

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath)

      setArticleFormData(prev => ({ ...prev, image_url: publicUrl }))
      setImagePreview(publicUrl)
      toast.success('Image uploaded successfully')
    } catch (err: any) {
      console.error('Error uploading image:', err)
      const errorMessage = err.message || 'Failed to upload image'
      if (errorMessage.includes('Bucket not found') || errorMessage.includes('not found')) {
        toast.error('Storage bucket not found. Please create an "Articles" or "listings" bucket in Supabase Storage.')
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setUploadingImage(false)
    }
  }

  // Handle tag input
  const handleAddTag = () => {
    if (tagInput.trim() && !articleFormData.tags.includes(tagInput.trim())) {
      setArticleFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setArticleFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  // Handle article form submission
  const handleSubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingArticle(true)

    try {
      // Generate slug if not provided
      const slug = articleFormData.slug || generateSlug(articleFormData.title)
      
      // Calculate read time
      const readTime = articleFormData.read_time || calculateReadTime(articleFormData.content)

      // Use custom category if provided, otherwise use selected category
      const finalCategory = showCustomCategory && customCategory.trim() 
        ? customCategory.trim() 
        : articleFormData.category

      if (!finalCategory) {
        toast.error('Please select or enter a category')
        setSavingArticle(false)
        return
      }

      if (editingArticleId) {
        // Update existing article
        // Check if slug already exists (excluding current article)
        const { data: existing, error: checkError } = await supabase
          .from('resources')
          .select('id')
          .eq('slug', slug)
          .neq('id', editingArticleId)
          .maybeSingle()

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError
        }

        if (existing) {
          toast.error('An article with this slug already exists. Please change the title or slug.')
          setSavingArticle(false)
          return
        }

        const { error } = await supabase
          .from('resources')
          .update({
            title: articleFormData.title,
            slug,
            category: finalCategory,
            content: articleFormData.content,
            excerpt: articleFormData.excerpt,
            image_url: articleFormData.image_url || null,
            tags: articleFormData.tags,
            read_time: readTime,
            published: articleFormData.published
          })
          .eq('id', editingArticleId)

        if (error) throw error
        toast.success('Article updated successfully!')
      } else {
        // Create new article
        // Check if slug already exists
        const { data: existing, error: checkError } = await supabase
          .from('resources')
          .select('id')
          .eq('slug', slug)
          .maybeSingle()

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError
        }

        if (existing) {
          toast.error('An article with this slug already exists. Please change the title or slug.')
          setSavingArticle(false)
          return
        }

        const { error } = await supabase
          .from('resources')
          .insert({
            title: articleFormData.title,
            slug,
            category: finalCategory,
            content: articleFormData.content,
            excerpt: articleFormData.excerpt,
            image_url: articleFormData.image_url || null,
            tags: articleFormData.tags,
            read_time: readTime,
            published: articleFormData.published
          })

        if (error) throw error
        toast.success('Article created successfully!')
      }

      handleCancelEdit()
      await fetchData()
      await fetchCounts()
    } catch (err: any) {
      console.error('Error creating article:', err)
      toast.error(err.message || 'Failed to create article')
    } finally {
      setSavingArticle(false)
    }
  }

  // Auto-generate slug when title changes (always update slug from title)
  const handleTitleChange = (title: string) => {
    const newSlug = generateSlug(title)
    setArticleFormData(prev => ({
      ...prev,
      title,
      slug: newSlug
    }))
  }

  // Load article for editing
  const handleEditArticle = (article: any) => {
    setEditingArticleId(article.id)
    setArticleFormData({
      title: article.title,
      slug: article.slug,
      category: article.category,
      content: article.content,
      excerpt: article.excerpt,
      image_url: article.image_url || '',
      tags: article.tags || [],
      read_time: article.read_time || 0,
      published: article.published || false
    })
    setImagePreview(article.image_url || null)
    setShowArticleForm(true)
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingArticleId(null)
    setArticleFormData({
      title: '',
      slug: '',
      category: '',
      content: '',
      excerpt: '',
      image_url: '',
      tags: [],
      read_time: 0,
      published: false
    })
    setImagePreview(null)
    setTagInput('')
    setShowArticleForm(false)
    setShowCustomCategory(false)
    setCustomCategory('')
  }

  // Handle delete article
  const handleDeleteArticle = async (articleId: string, title: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)
    if (!confirmed) return

    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', articleId)

      if (error) throw error

      toast.success('Article deleted successfully')
      await fetchData()
      await fetchCounts()
    } catch (err: any) {
      console.error('Error deleting article:', err)
      toast.error(err.message || 'Failed to delete article')
    }
  }

  // Auto-calculate read time when content changes
  const handleContentChange = (content: string) => {
    setArticleFormData(prev => ({
      ...prev,
      content,
      read_time: calculateReadTime(content)
    }))
  }

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    // Prevent deleting yourself
    if (userId === user?.id) {
      toast.error('You cannot delete your own account.')
      return
    }

    // Confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete user "${userEmail}"?\n\nThis will permanently delete:\n- User account\n- All their listings\n- All their subscriptions\n\nThis action cannot be undone!`
    )

    if (!confirmed) return

    setDeletingUserId(userId)
    const deleteToast = toast.loading('Deleting user...')
    
    try {
      // Delete user from auth.users (this will cascade delete from public.users due to foreign key)
      // We need to use admin API for this, so we'll call an edge function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('Not authenticated')
      }

      const functionUrl = `${supabaseUrl}/functions/v1/admin-delete-user`

      console.log('Calling admin-delete-user function:', {
        functionUrl,
        userId,
        hasSession: !!session
      })

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({ userId }),
      })

      console.log('Function response status:', response.status)
      console.log('Function response ok:', response.ok)

      // Check if function doesn't exist (404) or CORS issue
      if (response.status === 404) {
        throw new Error('Edge Function not found. Please deploy the admin-delete-user function to Supabase.')
      }

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch {
          // If response isn't JSON, it might be a CORS or network error
          if (response.status === 0 || !response.status) {
            throw new Error('Network error or CORS issue. Please ensure the admin-delete-user Edge Function is deployed and CORS is configured correctly.')
          }
          errorData = { error: `HTTP ${response.status}: Failed to delete user` }
        }
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to delete user`)
      }

      // Parse response to check email status
      const result = await response.json()
      console.log('Function response data:', result)
      
      await fetchData()
      await fetchCounts()
      
      if (result.emailSent) {
        toast.success('User deleted successfully! Deletion email sent to user.', { id: deleteToast })
      } else if (result.emailError) {
        toast.success('User deleted successfully, but email could not be sent: ' + result.emailError, { id: deleteToast, duration: 8000 })
      } else {
        toast.success('User deleted successfully!', { id: deleteToast })
      }
    } catch (error: any) {
      console.error('Error deleting user:', error)
      const errorMessage = error.message || 'Failed to delete user. Please ensure the Edge Function is deployed.'
      toast.error(errorMessage, { id: deleteToast, duration: 6000 })
    } finally {
      setDeletingUserId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You must be an admin to access this page.</p>
          <a href="/" className="text-primary-600 hover:text-primary-700">Return to Home</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/20 to-gray-100 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gray-300 rounded-full blur-3xl"></div>
      </div>
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23333' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 text-lg">Manage listings, users, and subscriptions</p>
        </div>

        {/* Modern Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 shadow-sm border border-gray-200">
          <button
            onClick={() => handleTabChange('listings')}
            className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all ${
              activeTab === 'listings'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Listings ({counts.listings})
          </button>
          <button
            onClick={() => handleTabChange('users')}
            className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all ${
              activeTab === 'users'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Users ({counts.users})
          </button>
          <button
            onClick={() => handleTabChange('subscriptions')}
            className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all ${
              activeTab === 'subscriptions'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Subscriptions
          </button>
          <button
            onClick={() => handleTabChange('articles')}
            className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all ${
              activeTab === 'articles'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Articles ({counts.articles})
          </button>
          <button
            onClick={() => handleTabChange('content')}
            className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all ${
              activeTab === 'content'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Content & SEO
          </button>
          <button
            onClick={() => {
              handleTabChange('analytics')
              fetchAnalytics()
            }}
            className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all ${
              activeTab === 'analytics'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => handleTabChange('events')}
            className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all ${
              activeTab === 'events'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Events ({counts.events})
          </button>
          <button
            onClick={() => handleTabChange('mailinglist')}
            className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all ${
              activeTab === 'mailinglist'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Mailing List ({counts.mailinglist})
          </button>
        </div>

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div>
            <div className="mb-6 flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search listings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white shadow-sm"
                />
              </div>
              <button
                onClick={() => {
                  // Generate CSV with all filtered listings
                  const headers = ['Practice Name', 'Profession', 'Location', 'Email', 'Phone', 'Website', 'Status', 'Featured', 'Created At']
                  const rows = filteredListings.map(l => [
                    l.practice_name || '',
                    l.profession || '',
                    l.location || '',
                    l.email || '',
                    l.phone || '',
                    l.website || '',
                    l.status || '',
                    l.is_featured ? 'Yes' : 'No',
                    l.created_at ? format(new Date(l.created_at), 'yyyy-MM-dd') : ''
                  ])
                  const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `listings-export-${format(new Date(), 'yyyy-MM-dd')}.csv`
                  a.click()
                  URL.revokeObjectURL(url)
                  toast.success('Directory list downloaded successfully')
                }}
                className="px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap"
              >
                <FileSpreadsheet className="w-5 h-5" />
                Download CSV
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              {filteredListings.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-600">No listings found.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Practice Name</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Contact</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Location</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Featured</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Created</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {paginatedListings.map(listing => (
                      <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">{listing.practice_name}</div>
                          <div className="text-sm text-gray-500 mt-1">{listing.profession}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {listing.email}
                          </div>
                          {listing.phone && (
                            <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                              <Phone className="w-4 h-4 text-gray-400" />
                              {listing.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                          {listing.location}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(listing.status)}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleFeatured(listing.id, !listing.is_featured)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors ${
                              listing.is_featured
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title={listing.is_featured ? 'Remove from Featured' : 'Set as Featured'}
                          >
                            <Star className={`w-4 h-4 ${listing.is_featured ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                            {listing.is_featured ? 'Featured' : 'Not Featured'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {format(new Date(listing.created_at), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex gap-2 flex-wrap">
                            {listing.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleListingAction(listing.id, 'approve')}
                                  className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-semibold text-xs"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = prompt('Rejection reason:')
                                    if (reason) handleListingAction(listing.id, 'reject', reason)
                                  }}
                                  className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold text-xs"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => {
                                    const notes = prompt('Required changes:')
                                    if (notes) handleListingAction(listing.id, 'needs_changes', notes)
                                  }}
                                  className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-semibold text-xs"
                                >
                                  Needs Changes
                                </button>
                              </>
                            )}
                            {listing.status === 'needs_changes' && (
                              <button
                                onClick={() => handleListingAction(listing.id, 'approve')}
                                className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-semibold text-xs"
                              >
                                Approve
                              </button>
                            )}
                            <button
                              onClick={() => handleEditListing(listing)}
                              className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors font-semibold text-xs flex items-center gap-1"
                            >
                              <Edit className="w-3 h-3" />
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
                
                {/* Pagination */}
                {totalListingsPages > 1 && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {(currentListingsPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentListingsPage * ITEMS_PER_PAGE, filteredListings.length)} of {filteredListings.length} listings
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentListingsPage(prev => Math.max(1, prev - 1))}
                        disabled={currentListingsPage === 1}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalListingsPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => setCurrentListingsPage(page)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              currentListingsPage === page
                                ? 'bg-red-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setCurrentListingsPage(prev => Math.min(totalListingsPages, prev + 1))}
                        disabled={currentListingsPage === totalListingsPages}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="mb-6 flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users by email or role..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white shadow-sm"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              {filteredUsers.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-600">No users found.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email Verified</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Created</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {paginatedUsers.map(userItem => (
                      <tr key={userItem.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          {editingUserId === userItem.id ? (
                            <input
                              type="email"
                              value={editingUserEmail}
                              onChange={(e) => setEditingUserEmail(e.target.value)}
                              className="px-3 py-1.5 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white w-full"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-gray-900">{userItem.email}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingUserId === userItem.id ? (
                            <select
                              value={editingRole}
                              onChange={(e) => setEditingRole(e.target.value as 'admin' | 'lister' | 'public')}
                              className="px-3 py-1.5 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                            >
                              <option value="admin">Admin</option>
                              <option value="lister">Lister</option>
                              <option value="public">Public</option>
                            </select>
                          ) : (
                            <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${
                              userItem.role === 'admin' ? 'bg-red-100 text-red-800' :
                              userItem.role === 'lister' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {userItem.role}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingUserId === userItem.id ? (
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editingUserVerified}
                                onChange={(e) => setEditingUserVerified(e.target.checked)}
                                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                              />
                              <span className="text-xs font-semibold text-gray-700">
                                {editingUserVerified ? 'Verified' : 'Pending'}
                              </span>
                            </label>
                          ) : (
                            userItem.email_verified ? (
                              <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-green-100 text-green-800">
                                Verified
                              </span>
                            ) : (
                              <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-yellow-100 text-yellow-800">
                                Pending
                              </span>
                            )
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {format(new Date(userItem.created_at), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => handleResetPassword(userItem.id, userItem.email)}
                              className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-semibold text-xs flex items-center gap-1.5 w-full justify-center"
                              title="Reset user password"
                            >
                              <Key className="w-3 h-3" />
                              Reset Password
                            </button>
                            {!userItem.email_verified && (
                              <button
                                onClick={() => handleResendVerification(userItem.id, userItem.email)}
                                className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-semibold text-xs flex items-center gap-1.5 w-full justify-center"
                                title="Resend verification email"
                              >
                                <RefreshCw className="w-3 h-3" />
                                Resend Verification
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex items-center gap-2">
                            {editingUserId === userItem.id ? (
                              <>
                                <button
                                  onClick={() => handleUpdateUser(userItem.id)}
                                  disabled={updatingUser}
                                  className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-semibold text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                >
                                  {updatingUser ? (
                                    <>
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    'Save'
                                  )}
                                </button>
                                <button
                                  onClick={handleCancelEditUser}
                                  disabled={updatingUser}
                                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleStartEditUser(userItem)}
                                  className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-semibold text-xs"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(userItem.id, userItem.email)}
                                  disabled={deletingUserId === userItem.id || userItem.id === user?.id}
                                  className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                  title={userItem.id === user?.id ? "Cannot delete your own account" : "Delete user"}
                                >
                                  {deletingUserId === userItem.id ? (
                                    <>
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    <>
                                      <Trash2 className="w-3 h-3" />
                                      Delete
                                    </>
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
                
                {/* Pagination */}
                {totalUsersPages > 1 && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {(currentUsersPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentUsersPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentUsersPage(prev => Math.max(1, prev - 1))}
                        disabled={currentUsersPage === 1}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalUsersPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => setCurrentUsersPage(page)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              currentUsersPage === page
                                ? 'bg-red-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setCurrentUsersPage(prev => Math.min(totalUsersPages, prev + 1))}
                        disabled={currentUsersPage === totalUsersPages}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600">Subscription management coming soon...</p>
          </div>
        )}

        {/* Articles Tab */}
        {activeTab === 'articles' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Articles / Resources</h2>
              <button
                onClick={() => setShowArticleForm(!showArticleForm)}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all font-semibold flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {showArticleForm ? 'Cancel' : 'New Article'}
              </button>
            </div>

            {/* Article Form */}
            {showArticleForm && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  {editingArticleId ? 'Edit Article' : 'Create New Article'}
                </h3>
                <form onSubmit={handleSubmitArticle} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={articleFormData.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="Article title"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Slug *
                      </label>
                      <input
                        type="text"
                        required
                        value={articleFormData.slug}
                        onChange={(e) => setArticleFormData(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="article-slug"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category *
                    </label>
                    {!showCustomCategory ? (
                      <div className="space-y-2">
                        <select
                          required
                          value={articleFormData.category}
                          onChange={(e) => setArticleFormData(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="">Select category...</option>
                          <option value="For People Seeking Support">For People Seeking Support</option>
                          <option value="For Professionals & Clinics">For Professionals & Clinics</option>
                          <option value="For Families & Carers">For Families & Carers</option>
                          <option value="For Professionals & Employers">For Professionals & Employers</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => setShowCustomCategory(true)}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          + Add custom category
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="text"
                          required
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          placeholder="Enter custom category name"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setShowCustomCategory(false)
                            setCustomCategory('')
                            setArticleFormData(prev => ({ ...prev, category: '' }))
                          }}
                          className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                        >
                          ← Use predefined categories
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Excerpt *
                    </label>
                    <textarea
                      required
                      value={articleFormData.excerpt}
                      onChange={(e) => setArticleFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="Short description of the article"
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Content *
                    </label>
                    <textarea
                      required
                      value={articleFormData.content}
                      onChange={(e) => handleContentChange(e.target.value)}
                      placeholder="Full article content"
                      rows={10}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Read time: {articleFormData.read_time} min (auto-calculated)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Image
                    </label>
                    {imagePreview && (
                      <div className="mb-3 relative w-32 h-32 rounded-xl overflow-hidden border-2 border-primary-200">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null)
                            setArticleFormData(prev => ({ ...prev, image_url: '' }))
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
                      />
                      {uploadingImage && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Max size: 5MB. Recommended: 1200x630px</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tags
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddTag()
                          }
                        }}
                        placeholder="Add a tag and press Enter"
                        className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all"
                      >
                        Add
                      </button>
                    </div>
                    {articleFormData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {articleFormData.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="hover:text-primary-900"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="published"
                      checked={articleFormData.published}
                      onChange={(e) => setArticleFormData(prev => ({ ...prev, published: e.target.checked }))}
                      className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="published" className="text-sm font-semibold text-gray-700">
                      Publish immediately
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={savingArticle}
                      className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {savingArticle ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {editingArticleId ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          <FileText className="w-5 h-5" />
                          {editingArticleId ? 'Update Article' : 'Create Article'}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Articles List */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Read Time</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {articles.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          No articles yet. Create your first article above.
                        </td>
                      </tr>
                    ) : (
                      articles.map((article) => (
                        <tr key={article.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{article.title}</div>
                            <div className="text-xs text-gray-500">/{article.slug}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-700">
                              {article.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {article.published ? (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                                Published
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
                                Draft
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {article.read_time} min
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(new Date(article.created_at), 'MMM d, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditArticle(article)}
                                className="text-primary-600 hover:text-primary-900 transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteArticle(article.id, article.title)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Content & SEO Tab */}
        {activeTab === 'content' && (
          <ContentManagementSection />
        )}
        
        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Analytics & Insights</h2>
                <p className="text-sm text-gray-500 mt-1">Track user behavior, searches, filters, and clicks</p>
              </div>
              <button
                onClick={fetchAnalytics}
                disabled={analyticsLoading}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 flex items-center gap-2"
              >
                {analyticsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
                {analyticsLoading ? 'Loading...' : 'Refresh Data'}
              </button>
            </div>

            {analyticsLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
                <p className="text-gray-600">Loading analytics data...</p>
              </div>
            ) : analyticsData.topPages.length === 0 && 
                analyticsData.topSearches.length === 0 && 
                analyticsData.topFilters.length === 0 && 
                analyticsData.topReferrers.length === 0 && 
                analyticsData.topListings.length === 0 && 
                analyticsData.topLinks.length === 0 && 
                analyticsData.avgTimeOnPage.length === 0 ? (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 text-center">
                <BarChart3 className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Analytics Data Yet</h3>
                <p className="text-gray-600 mb-4">
                  The analytics table needs to be created in your Supabase database.
                </p>
                <div className="bg-white rounded-lg p-4 text-left max-w-2xl mx-auto">
                  <p className="text-sm font-semibold text-gray-900 mb-2">To set up analytics:</p>
                  <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                    <li>Open your Supabase Dashboard</li>
                    <li>Go to SQL Editor</li>
                    <li>Run the SQL script: <code className="bg-gray-100 px-2 py-1 rounded">create-analytics-table.sql</code></li>
                    <li>Once the table is created, analytics will start tracking automatically</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Pages */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-primary-500" />
                    <h3 className="text-lg font-bold text-gray-900">Most Visited Pages</h3>
                  </div>
                  <div className="space-y-3">
                    {analyticsData.topPages.length > 0 ? (
                      analyticsData.topPages.map((page, idx) => (
                        <div key={page.page_path} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-sm font-bold text-gray-500 w-6 flex-shrink-0">{idx + 1}</span>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-gray-900 font-medium block">{page.display_name}</span>
                              <span className="text-xs text-gray-500 truncate">{page.page_path}</span>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-primary-600 flex-shrink-0 ml-2">{page.views} views</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No page view data yet</p>
                    )}
                  </div>
                </div>

                {/* Top Searches */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Search className="w-5 h-5 text-primary-500" />
                    <h3 className="text-lg font-bold text-gray-900">Top Search Queries</h3>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {analyticsData.topSearches.length > 0 ? (
                      analyticsData.topSearches.map((search, idx) => (
                        <div key={search.query} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-sm font-bold text-gray-500 w-6 flex-shrink-0">{idx + 1}</span>
                            <span className="text-sm text-gray-900 font-medium truncate">{search.query}</span>
                          </div>
                          <span className="text-sm font-bold text-primary-600 flex-shrink-0 ml-2">{search.searches}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No search data yet</p>
                    )}
                  </div>
                </div>

                {/* Top Filters */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-primary-500" />
                    <h3 className="text-lg font-bold text-gray-900">Most Used Filters</h3>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {analyticsData.topFilters.length > 0 ? (
                      analyticsData.topFilters.map((filter, idx) => (
                        <div key={`${filter.filter_type}-${filter.filter_value}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-sm font-bold text-gray-500 w-6 flex-shrink-0">{idx + 1}</span>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs text-gray-500 block">{filter.filter_type}</span>
                              <span className="text-sm text-gray-900 font-medium truncate">{filter.filter_value}</span>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-primary-600 flex-shrink-0 ml-2">{filter.uses}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No filter data yet</p>
                    )}
                  </div>
                </div>

                {/* Top Referrers */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="w-5 h-5 text-primary-500" />
                    <h3 className="text-lg font-bold text-gray-900">Top Referrers</h3>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {analyticsData.topReferrers.length > 0 ? (
                      analyticsData.topReferrers.map((ref, idx) => (
                        <div key={ref.referrer} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-sm font-bold text-gray-500 w-6 flex-shrink-0">{idx + 1}</span>
                            <span className="text-sm text-gray-900 font-medium truncate">{ref.referrer || 'Direct'}</span>
                          </div>
                          <span className="text-sm font-bold text-primary-600 flex-shrink-0 ml-2">{ref.visits}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No referrer data yet</p>
                    )}
                  </div>
                </div>

                {/* Top Listing Clicks */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MousePointer className="w-5 h-5 text-primary-500" />
                    <h3 className="text-lg font-bold text-gray-900">Most Clicked Listings</h3>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {analyticsData.topListings.length > 0 ? (
                      analyticsData.topListings.map((listing, idx) => (
                        <div key={listing.listing_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-sm font-bold text-gray-500 w-6 flex-shrink-0">{idx + 1}</span>
                            <span className="text-sm text-gray-900 font-medium truncate">{listing.listing_name}</span>
                          </div>
                          <span className="text-sm font-bold text-primary-600 flex-shrink-0 ml-2">{listing.clicks} clicks</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No listing click data yet</p>
                    )}
                  </div>
                </div>

                {/* Top Link Clicks */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ExternalLink className="w-5 h-5 text-primary-500" />
                    <h3 className="text-lg font-bold text-gray-900">Most Clicked Links</h3>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {analyticsData.topLinks.length > 0 ? (
                      analyticsData.topLinks.map((link, idx) => (
                        <div key={link.url} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-sm font-bold text-gray-500 w-6 flex-shrink-0">{idx + 1}</span>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs text-gray-500 block truncate">{link.url}</span>
                              <span className="text-sm text-gray-900 font-medium">{link.link_text}</span>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-primary-600 flex-shrink-0 ml-2">{link.clicks} clicks</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No link click data yet</p>
                    )}
                  </div>
                </div>

                {/* Average Time on Page */}
                <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-primary-500" />
                    <h3 className="text-lg font-bold text-gray-900">Average Time on Page</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analyticsData.avgTimeOnPage.length > 0 ? (
                      analyticsData.avgTimeOnPage.map((page) => (
                        <div key={page.page_path} className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-sm font-semibold text-gray-900 mb-1">{page.display_name}</div>
                          <div className="text-xs text-gray-500 mb-2 truncate">{page.page_path}</div>
                          <div className="text-lg font-bold text-primary-600">{Math.floor(page.avg_seconds / 60)}m {page.avg_seconds % 60}s</div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm col-span-full">No time data yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Events Management</h2>
                <p className="text-gray-600">Manage community events, workshops, and seminars</p>
              </div>
              <button
                onClick={() => {
                  setShowEventForm(true)
                  setEditingEventId(null)
                  setEventFormData({
                    title: '',
                    description: '',
                    event_date: '',
                    event_end_date: '',
                    location: '',
                    location_address: '',
                    event_type: 'workshop',
                    organizer_name: '',
                    organizer_email: '',
                    organizer_phone: '',
                    registration_url: '',
                    image_url: '',
                    is_published: false,
                    max_attendees: '',
                    cost: '',
                    tags: []
                  })
                }}
                className="px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Event
              </button>
            </div>

            {/* Events List */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {events.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          No events yet. Click "Add Event" to create one.
                        </td>
                      </tr>
                    ) : (
                      events.map((event) => (
                        <tr key={event.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">{event.title}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(new Date(event.event_date), 'MMM d, yyyy h:mm a')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.location}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{event.event_type}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {event.is_published ? (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Published</span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Draft</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => {
                                setEditingEventId(event.id)
                                setEventFormData({
                                  title: event.title,
                                  description: event.description || '',
                                  event_date: new Date(event.event_date).toISOString().slice(0, 16),
                                  event_end_date: event.event_end_date ? new Date(event.event_end_date).toISOString().slice(0, 16) : '',
                                  location: event.location,
                                  location_address: event.location_address || '',
                                  event_type: event.event_type,
                                  organizer_name: event.organizer_name || '',
                                  organizer_email: event.organizer_email || '',
                                  organizer_phone: event.organizer_phone || '',
                                  registration_url: event.registration_url || '',
                                  image_url: event.image_url || '',
                                  is_published: event.is_published || false,
                                  max_attendees: event.max_attendees?.toString() || '',
                                  cost: event.cost || '',
                                  tags: event.tags || []
                                })
                                setShowEventForm(true)
                              }}
                              className="text-primary-600 hover:text-primary-900 mr-4"
                            >
                              <Edit className="w-4 h-4 inline" />
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm('Are you sure you want to delete this event?')) {
                                  const { error } = await supabase
                                    .from('events')
                                    .delete()
                                    .eq('id', event.id)
                                  if (error) {
                                    toast.error('Failed to delete event')
                                  } else {
                                    toast.success('Event deleted')
                                    await fetchData()
                                    await fetchCounts()
                                  }
                                }
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4 inline" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Event Form Modal */}
            {showEventForm && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 pt-24 sm:pt-32 overflow-hidden">
                <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[calc(100vh-6rem)] overflow-hidden flex flex-col">
                  {/* Header - Fixed */}
                  <div className="flex-shrink-0 bg-gradient-to-r from-primary-500 to-primary-600 px-8 py-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">
                          {editingEventId ? 'Edit Event' : 'Create New Event'}
                        </h3>
                      </div>
                      <button
                        onClick={() => {
                          setShowEventForm(false)
                          setEditingEventId(null)
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Form Content - Scrollable */}
                    <div className="flex-1 overflow-y-auto">
                      <form
                      onSubmit={async (e) => {
                        e.preventDefault()
                        setSavingEvent(true)
                        try {
                          const eventData = {
                            ...eventFormData,
                            max_attendees: eventFormData.max_attendees ? parseInt(eventFormData.max_attendees) : null,
                            event_date: new Date(eventFormData.event_date).toISOString(),
                            event_end_date: eventFormData.event_end_date ? new Date(eventFormData.event_end_date).toISOString() : null
                          }

                          let savedEvent: any = null
                          if (editingEventId) {
                            const { data, error } = await supabase
                              .from('events')
                              .update(eventData)
                              .eq('id', editingEventId)
                              .select()
                              .single()
                            if (error) throw error
                            savedEvent = data
                            toast.success('Event updated successfully')
                          } else {
                            const { data, error } = await supabase
                              .from('events')
                              .insert([eventData])
                              .select()
                              .single()
                            if (error) throw error
                            savedEvent = data
                            toast.success('Event created successfully')
                          }

                          // Send notifications to subscribers if event is published
                          if (savedEvent && savedEvent.is_published) {
                            try {
                              // Fetch all active subscribers
                              const { data: subscribers } = await supabase
                                .from('event_subscriptions')
                                .select('email')
                                .eq('is_active', true)

                              if (subscribers && subscribers.length > 0) {
                                const eventDate = new Date(savedEvent.event_date)
                                const now = new Date()
                                const eventStatus = eventDate > now ? 'new' : 
                                                  (savedEvent.event_end_date && new Date(savedEvent.event_end_date) < now) ? 'ended' : 'ongoing'

                                // Send email to each subscriber
                                const emailPromises = subscribers.map(async (sub: { email: string }) => {
                                  try {
                                    const template = getEmailTemplate('event_notification', {
                                      email: sub.email,
                                      userName: sub.email.split('@')[0],
                                      eventTitle: savedEvent.title,
                                      eventDescription: savedEvent.description || '',
                                      eventDate: format(eventDate, 'EEEE, MMMM dd, yyyy'),
                                      eventTime: format(eventDate, 'h:mm a'),
                                      eventEndDate: savedEvent.event_end_date ? format(new Date(savedEvent.event_end_date), 'EEEE, MMMM dd, yyyy') : '',
                                      eventEndTime: savedEvent.event_end_date ? format(new Date(savedEvent.event_end_date), 'h:mm a') : '',
                                      location: savedEvent.location,
                                      locationAddress: savedEvent.location_address || '',
                                      eventType: savedEvent.event_type,
                                      cost: savedEvent.cost || 'Free',
                                      registrationUrl: savedEvent.registration_url || '',
                                      organizerName: savedEvent.organizer_name || '',
                                      eventStatus: eventStatus,
                                      appUrl: window.location.origin,
                                      eventsUrl: `${window.location.origin}/events`
                                    })

                                    await sendEmail({
                                      to: sub.email,
                                      subject: eventStatus === 'new' 
                                        ? `New Event: ${savedEvent.title}`
                                        : eventStatus === 'ended'
                                        ? `Event Ended: ${savedEvent.title}`
                                        : `Event Update: ${savedEvent.title}`,
                                      html: template.html
                                    })
                                  } catch (emailErr) {
                                    console.error(`Failed to send email to ${sub.email}:`, emailErr)
                                  }
                                })

                                // Send emails in background (don't wait)
                                Promise.all(emailPromises).then(() => {
                                  console.log(`Event notifications sent to ${subscribers.length} subscribers`)
                                }).catch(err => {
                                  console.error('Error sending event notifications:', err)
                                })
                              }
                            } catch (notifErr) {
                              console.error('Error sending event notifications:', notifErr)
                              // Don't fail event save if notifications fail
                            }
                          }

                          setShowEventForm(false)
                          setEditingEventId(null)
                          await fetchData()
                          // Update counts after saving
                          const { count: eventsCount } = await supabase
                            .from('events')
                            .select('*', { count: 'exact', head: true })
                          setCounts(prev => ({ ...prev, events: eventsCount || 0 }))
                        } catch (error: any) {
                          toast.error(error.message || 'Failed to save event')
                        } finally {
                          setSavingEvent(false)
                        }
                      }}
                      className="p-8 space-y-8"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Event Title */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary-500" />
                            Event Title *
                          </label>
                          <input
                            type="text"
                            required
                            value={eventFormData.title}
                            onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white"
                            placeholder="Enter event title"
                          />
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-gray-900 mb-2">Description</label>
                          <textarea
                            rows={4}
                            value={eventFormData.description}
                            onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white resize-y"
                            placeholder="Describe the event..."
                          />
                        </div>

                        {/* Event Date & Time */}
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary-500" />
                            Event Date & Time *
                          </label>
                          <input
                            type="datetime-local"
                            required
                            value={eventFormData.event_date}
                            onChange={(e) => setEventFormData({ ...eventFormData, event_date: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white"
                          />
                        </div>

                        {/* End Date & Time */}
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary-500" />
                            End Date & Time
                          </label>
                          <input
                            type="datetime-local"
                            value={eventFormData.event_end_date}
                            onChange={(e) => setEventFormData({ ...eventFormData, event_end_date: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white"
                          />
                        </div>

                        {/* Location */}
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary-500" />
                            Location *
                          </label>
                          <input
                            type="text"
                            required
                            value={eventFormData.location}
                            onChange={(e) => setEventFormData({ ...eventFormData, location: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white"
                            placeholder="e.g., Hobart, Launceston"
                          />
                        </div>

                        {/* Address */}
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary-500" />
                            Full Address
                          </label>
                          <input
                            type="text"
                            value={eventFormData.location_address}
                            onChange={(e) => setEventFormData({ ...eventFormData, location_address: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white"
                            placeholder="Street address"
                          />
                        </div>

                        {/* Event Type */}
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-primary-500" />
                            Event Type *
                          </label>
                          <select
                            required
                            value={eventFormData.event_type}
                            onChange={(e) => setEventFormData({ ...eventFormData, event_type: e.target.value as any })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white"
                          >
                            <option value="workshop">Workshop</option>
                            <option value="seminar">Seminar</option>
                            <option value="support_group">Support Group</option>
                            <option value="conference">Conference</option>
                            <option value="training">Training</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        {/* Cost */}
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2">Cost</label>
                          <input
                            type="text"
                            placeholder="e.g., Free, $50, Donation"
                            value={eventFormData.cost}
                            onChange={(e) => setEventFormData({ ...eventFormData, cost: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white"
                          />
                        </div>

                        {/* Organizer Name */}
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-primary-500" />
                            Organizer Name
                          </label>
                          <input
                            type="text"
                            value={eventFormData.organizer_name}
                            onChange={(e) => setEventFormData({ ...eventFormData, organizer_name: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white"
                            placeholder="Organizer or organization name"
                          />
                        </div>

                        {/* Organizer Email */}
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-primary-500" />
                            Organizer Email
                          </label>
                          <input
                            type="email"
                            value={eventFormData.organizer_email}
                            onChange={(e) => setEventFormData({ ...eventFormData, organizer_email: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white"
                            placeholder="organizer@example.com"
                          />
                        </div>

                        {/* Organizer Phone */}
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Phone className="w-4 h-4 text-primary-500" />
                            Organizer Phone
                          </label>
                          <input
                            type="tel"
                            value={eventFormData.organizer_phone}
                            onChange={(e) => setEventFormData({ ...eventFormData, organizer_phone: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white"
                            placeholder="+61 3 1234 5678"
                          />
                        </div>

                        {/* Registration URL */}
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-primary-500" />
                            Registration URL
                          </label>
                          <input
                            type="url"
                            value={eventFormData.registration_url}
                            onChange={(e) => setEventFormData({ ...eventFormData, registration_url: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white"
                            placeholder="https://..."
                          />
                        </div>

                        {/* Max Attendees */}
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2">Max Attendees</label>
                          <input
                            type="number"
                            value={eventFormData.max_attendees}
                            onChange={(e) => setEventFormData({ ...eventFormData, max_attendees: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white"
                            placeholder="Leave empty for unlimited"
                          />
                        </div>

                        {/* Image URL */}
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary-500" />
                            Image URL
                          </label>
                          <input
                            type="url"
                            value={eventFormData.image_url}
                            onChange={(e) => setEventFormData({ ...eventFormData, image_url: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white"
                            placeholder="https://..."
                          />
                        </div>

                        {/* Tags */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-primary-500" />
                            Tags
                          </label>
                          <div className="flex flex-wrap gap-2 mb-3 p-4 bg-gray-50 rounded-xl border-2 border-gray-200 min-h-[60px]">
                            {eventFormData.tags.length === 0 ? (
                              <span className="text-sm text-gray-400 italic">No tags added yet</span>
                            ) : (
                              eventFormData.tags.map((tag, idx) => (
                                <span key={idx} className="px-3 py-1.5 bg-primary-500 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm">
                                  {tag}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEventFormData({
                                        ...eventFormData,
                                        tags: eventFormData.tags.filter((_, i) => i !== idx)
                                      })
                                    }}
                                    className="text-white hover:text-gray-200 transition-colors"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </span>
                              ))
                            )}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={eventTagInput}
                              onChange={(e) => setEventTagInput(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  if (eventTagInput.trim() && !eventFormData.tags.includes(eventTagInput.trim())) {
                                    setEventFormData({
                                      ...eventFormData,
                                      tags: [...eventFormData.tags, eventTagInput.trim()]
                                    })
                                    setEventTagInput('')
                                  }
                                }
                              }}
                              placeholder="Add tag and press Enter"
                              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (eventTagInput.trim() && !eventFormData.tags.includes(eventTagInput.trim())) {
                                  setEventFormData({
                                    ...eventFormData,
                                    tags: [...eventFormData.tags, eventTagInput.trim()]
                                  })
                                  setEventTagInput('')
                                }
                              }}
                              className="px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors shadow-md hover:shadow-lg"
                            >
                              Add
                            </button>
                          </div>
                        </div>

                      </div>

                      {/* Publish Option */}
                      <div className="md:col-span-2 pt-6 border-t-2 border-gray-200">
                        <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-primary-300 transition-colors">
                          <input
                            type="checkbox"
                            checked={eventFormData.is_published}
                            onChange={(e) => setEventFormData({ ...eventFormData, is_published: e.target.checked })}
                            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-bold text-gray-900 block">Publish Event</span>
                            <span className="text-xs text-gray-600">Make this event visible on the public Events page</span>
                          </div>
                        </label>
                      </div>

                      {/* Form Actions */}
                      <div className="flex justify-end gap-4 pt-6 border-t-2 border-gray-200 mt-8">
                        <button
                          type="button"
                          onClick={() => {
                            setShowEventForm(false)
                            setEditingEventId(null)
                          }}
                          className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={savingEvent}
                          className="px-8 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                        >
                          {savingEvent ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <FileText className="w-5 h-5" />
                              {editingEventId ? 'Update Event' : 'Create Event'}
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mailing List Tab */}
        {activeTab === 'mailinglist' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Event Mailing List</h2>
                <p className="text-gray-600">Manage event notification subscribers</p>
              </div>
              <button
                onClick={handleExportMailingList}
                className="px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <FileSpreadsheet className="w-5 h-5" />
                Export CSV
              </button>
            </div>

            <div className="mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by email..."
                  value={mailingListSearch}
                  onChange={(e) => setMailingListSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-sm"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              {mailingList.length === 0 ? (
                <div className="p-12 text-center">
                  <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg font-semibold">No subscribers yet</p>
                  <p className="text-gray-500 text-sm mt-2">Subscribers will appear here when they sign up on the Events page</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Subscribed At</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Unsubscribed At</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {mailingList
                          .filter(sub => 
                            !mailingListSearch || 
                            sub.email.toLowerCase().includes(mailingListSearch.toLowerCase())
                          )
                          .slice((currentMailingListPage - 1) * ITEMS_PER_PAGE, currentMailingListPage * ITEMS_PER_PAGE)
                          .map(subscription => (
                            <tr key={subscription.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm font-semibold text-gray-900">{subscription.email}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {subscription.is_active ? (
                                  <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-green-100 text-green-800">
                                    Active
                                  </span>
                                ) : (
                                  <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-gray-100 text-gray-800">
                                    Inactive
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {format(new Date(subscription.subscribed_at), 'MMM dd, yyyy HH:mm')}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {subscription.unsubscribed_at 
                                  ? format(new Date(subscription.unsubscribed_at), 'MMM dd, yyyy HH:mm')
                                  : '-'
                                }
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination */}
                  {Math.ceil(mailingList.filter(sub => 
                    !mailingListSearch || 
                    sub.email.toLowerCase().includes(mailingListSearch.toLowerCase())
                  ).length / ITEMS_PER_PAGE) > 1 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Showing {(currentMailingListPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(
                          currentMailingListPage * ITEMS_PER_PAGE,
                          mailingList.filter(sub => 
                            !mailingListSearch || 
                            sub.email.toLowerCase().includes(mailingListSearch.toLowerCase())
                          ).length
                        )} of {mailingList.filter(sub => 
                          !mailingListSearch || 
                          sub.email.toLowerCase().includes(mailingListSearch.toLowerCase())
                        ).length} subscribers
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentMailingListPage(prev => Math.max(1, prev - 1))}
                          disabled={currentMailingListPage === 1}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </button>
                        <div className="flex items-center gap-1">
                          {Array.from({ 
                            length: Math.ceil(mailingList.filter(sub => 
                              !mailingListSearch || 
                              sub.email.toLowerCase().includes(mailingListSearch.toLowerCase())
                            ).length / ITEMS_PER_PAGE) 
                          }, (_, i) => i + 1).map(page => (
                            <button
                              key={page}
                              onClick={() => setCurrentMailingListPage(page)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                currentMailingListPage === page
                                  ? 'bg-red-600 text-white'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => setCurrentMailingListPage(prev => Math.min(
                            Math.ceil(mailingList.filter(sub => 
                              !mailingListSearch || 
                              sub.email.toLowerCase().includes(mailingListSearch.toLowerCase())
                            ).length / ITEMS_PER_PAGE),
                            prev + 1
                          ))}
                          disabled={currentMailingListPage >= Math.ceil(mailingList.filter(sub => 
                            !mailingListSearch || 
                            sub.email.toLowerCase().includes(mailingListSearch.toLowerCase())
                          ).length / ITEMS_PER_PAGE)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Listing Edit Modal */}
        {editingListingId && listingFormData && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 pt-24 sm:pt-32 overflow-hidden">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[calc(100vh-6rem)] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex-shrink-0 bg-gradient-to-r from-primary-500 to-primary-600 px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Edit className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Edit Listing</h3>
                </div>
                <button
                  onClick={() => {
                    setEditingListingId(null)
                    setListingFormData(null)
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-8">
                <div className="space-y-6">
                  {/* Practice Name */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Practice Name *</label>
                    <input
                      type="text"
                      required
                      value={listingFormData.practice_name}
                      onChange={(e) => setListingFormData({ ...listingFormData, practice_name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Email *</label>
                      <input
                        type="email"
                        required
                        value={listingFormData.email}
                        onChange={(e) => setListingFormData({ ...listingFormData, email: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Phone *</label>
                      <input
                        type="tel"
                        required
                        value={listingFormData.phone}
                        onChange={(e) => setListingFormData({ ...listingFormData, phone: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Website</label>
                    <input
                      type="url"
                      value={listingFormData.website}
                      onChange={(e) => setListingFormData({ ...listingFormData, website: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="https://example.com"
                    />
                  </div>

                  {/* Profession & Practice Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Profession *</label>
                      <select
                        required
                        value={listingFormData.profession}
                        onChange={(e) => setListingFormData({ ...listingFormData, profession: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        {PROFESSIONS.map(prof => (
                          <option key={prof} value={prof}>{prof}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Practice Type *</label>
                      <select
                        required
                        value={listingFormData.practice_type}
                        onChange={(e) => setListingFormData({ ...listingFormData, practice_type: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        {PRACTICE_TYPES.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Location & Postcode */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Location *</label>
                      <select
                        required
                        value={listingFormData.location}
                        onChange={(e) => setListingFormData({ ...listingFormData, location: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        {LOCATIONS.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Postcode *</label>
                      <input
                        type="text"
                        required
                        value={listingFormData.postcode}
                        onChange={(e) => setListingFormData({ ...listingFormData, postcode: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  {/* Street Address */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Street Address</label>
                    <input
                      type="text"
                      value={listingFormData.street_address}
                      onChange={(e) => setListingFormData({ ...listingFormData, street_address: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  {/* Specialties */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Specialties</label>
                    <div className="border-2 border-gray-200 rounded-xl p-4 max-h-48 overflow-y-auto">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {SPECIALTIES.map(specialty => (
                          <label key={specialty} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={listingFormData.specialties.includes(specialty)}
                              onChange={() => {
                                const current = listingFormData.specialties || []
                                if (current.includes(specialty)) {
                                  setListingFormData({
                                    ...listingFormData,
                                    specialties: current.filter((s: string) => s !== specialty)
                                  })
                                } else {
                                  setListingFormData({
                                    ...listingFormData,
                                    specialties: [...current, specialty]
                                  })
                                }
                              }}
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
                    <label className="block text-sm font-bold text-gray-900 mb-2">Bio</label>
                    <textarea
                      value={listingFormData.bio}
                      onChange={(e) => setListingFormData({ ...listingFormData, bio: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Tell us about your practice..."
                    />
                  </div>

                  {/* Service Options */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer p-4 border-2 border-gray-200 rounded-xl hover:border-primary-300">
                      <input
                        type="checkbox"
                        checked={listingFormData.is_telehealth}
                        onChange={(e) => setListingFormData({ ...listingFormData, is_telehealth: e.target.checked })}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-semibold text-gray-900">Telehealth</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-4 border-2 border-gray-200 rounded-xl hover:border-primary-300">
                      <input
                        type="checkbox"
                        checked={listingFormData.is_rural_outreach}
                        onChange={(e) => setListingFormData({ ...listingFormData, is_rural_outreach: e.target.checked })}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-semibold text-gray-900">Rural Outreach</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-4 border-2 border-gray-200 rounded-xl hover:border-primary-300">
                      <input
                        type="checkbox"
                        checked={listingFormData.is_statewide_telehealth}
                        onChange={(e) => setListingFormData({ ...listingFormData, is_statewide_telehealth: e.target.checked })}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-semibold text-gray-900">Statewide Telehealth</span>
                    </label>
                  </div>

                  {/* Visibility Options */}
                  <div className="border-t-2 border-gray-200 pt-6">
                    <h4 className="text-sm font-bold text-gray-900 mb-4">Visibility Settings</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={listingFormData.show_name_publicly}
                          onChange={(e) => setListingFormData({ ...listingFormData, show_name_publicly: e.target.checked })}
                          className="w-4 h-4 text-primary-600 rounded"
                        />
                        <span className="text-sm text-gray-700">Show Name</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={listingFormData.show_email_publicly}
                          onChange={(e) => setListingFormData({ ...listingFormData, show_email_publicly: e.target.checked })}
                          className="w-4 h-4 text-primary-600 rounded"
                        />
                        <span className="text-sm text-gray-700">Show Email</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={listingFormData.show_phone_publicly}
                          onChange={(e) => setListingFormData({ ...listingFormData, show_phone_publicly: e.target.checked })}
                          className="w-4 h-4 text-primary-600 rounded"
                        />
                        <span className="text-sm text-gray-700">Show Phone</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={listingFormData.show_website_publicly}
                          onChange={(e) => setListingFormData({ ...listingFormData, show_website_publicly: e.target.checked })}
                          className="w-4 h-4 text-primary-600 rounded"
                        />
                        <span className="text-sm text-gray-700">Show Website</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 border-t-2 border-gray-200 p-6 flex justify-end gap-4">
                <button
                  onClick={() => {
                    setEditingListingId(null)
                    setListingFormData(null)
                  }}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveListing}
                  disabled={savingListing}
                  className="px-8 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {savingListing ? (
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
              </div>
            </div>
          </div>
        )}

        {/* Password Reset Modal */}
        {showPasswordResetModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Key className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Reset Password</h3>
              </div>
              <p className="text-gray-600 mb-6">
                A password reset email will be sent to <strong>{passwordResetEmail}</strong>. The user will receive instructions to set a new password.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowPasswordResetModal(false)
                    setPasswordResetUserId(null)
                    setPasswordResetEmail('')
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPasswordReset}
                  disabled={resettingPassword}
                  className="flex-1 px-6 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {resettingPassword ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Send Reset Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Content Management Component
function ContentManagementSection() {
  const [contentSettings, setContentSettings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [editedValues, setEditedValues] = useState<Record<string, string>>({})
  const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({})
  const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchContentSettings()
  }, [])

  const fetchContentSettings = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('site_content_settings')
        .select('*')
        .order('page_path, category, label')

      if (error) throw error
      setContentSettings(data || [])
      
      // Initialize edited values
      const initialValues: Record<string, string> = {}
      const initialPreviews: Record<string, string> = {}
      data?.forEach(setting => {
        initialValues[setting.setting_key] = setting.value
        if (setting.setting_type === 'image_url' && setting.value) {
          initialPreviews[setting.setting_key] = setting.value
        }
      })
      setEditedValues(initialValues)
      setImagePreviews(initialPreviews)
    } catch (error) {
      console.error('Error fetching content settings:', error)
      toast.error('Failed to load content settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Update all changed settings
      const updates = Object.entries(editedValues).map(([key, value]) => {
        const original = contentSettings.find(s => s.setting_key === key)
        if (original && original.value !== value) {
          return supabase
            .from('site_content_settings')
            .update({ value })
            .eq('setting_key', key)
        }
        return null
      }).filter(Boolean)

      await Promise.all(updates)
      toast.success('Content settings saved successfully!')
      
      // Refresh to get updated values (real-time subscription will also trigger)
      await fetchContentSettings()
    } catch (error) {
      console.error('Error saving content settings:', error)
      toast.error('Failed to save content settings')
    } finally {
      setSaving(false)
    }
  }

  const handleValueChange = (key: string, value: string) => {
    setEditedValues(prev => ({ ...prev, [key]: value }))
    // Update preview if it's an image URL
    if (value && value.startsWith('http')) {
      setImagePreviews(prev => ({ ...prev, [key]: value }))
    }
  }

  const handleBackgroundImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, settingKey: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    // SECURITY: Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)')
      return
    }

    // SECURITY: Validate file extension
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    if (!fileExt || !validExtensions.includes(fileExt)) {
      toast.error('Invalid file extension. Please upload a valid image file.')
      return
    }

    // SECURITY: Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    // SECURITY: Validate minimum file size
    if (file.size < 100) {
      toast.error('File appears to be corrupted or empty')
      return
    }

    setUploadingImages(prev => ({ ...prev, [settingKey]: true }))
    try {
      // SECURITY: Sanitize filename
      const sanitizedFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`.replace(/[^a-zA-Z0-9._-]/g, '')
      const filePath = `backgrounds/${sanitizedFileName}`

      // Try 'Articles' bucket first, fallback to 'listings'
      let bucketName = 'Articles'
      let uploadError = null

      const { error: articlesError } = await supabase.storage
        .from('Articles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (articlesError) {
        if (articlesError.message?.includes('not found') || articlesError.message?.includes('Bucket')) {
          bucketName = 'listings'
          const { error: listingsError } = await supabase.storage
            .from('listings')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            })
          uploadError = listingsError
        } else {
          uploadError = articlesError
        }
      }

      if (uploadError) {
        throw new Error(uploadError.message || 'Upload failed')
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath)

      // Update the setting value
      handleValueChange(settingKey, publicUrl)
      toast.success('Background image uploaded successfully!')
    } catch (error: any) {
      console.error('Error uploading background image:', error)
      toast.error(error.message || 'Failed to upload background image')
    } finally {
      setUploadingImages(prev => ({ ...prev, [settingKey]: false }))
    }
  }

  const handleRemoveBackgroundImage = (settingKey: string) => {
    handleValueChange(settingKey, '')
    setImagePreviews(prev => {
      const newPreviews = { ...prev }
      delete newPreviews[settingKey]
      return newPreviews
    })
  }

  const categories = ['all', 'hero', 'heading', 'meta', 'seo', 'button', 'color', 'typography', 'description', 'general', 'background']
  const filteredSettings = activeCategory === 'all' 
    ? contentSettings 
    : contentSettings.filter(s => s.category === activeCategory)

  const groupedByPage = filteredSettings.reduce((acc, setting) => {
    const page = setting.page_path || 'global'
    if (!acc[page]) acc[page] = []
    acc[page].push(setting)
    return acc
  }, {} as Record<string, any[]>)

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-red-600" />
        <p className="text-gray-600">Loading content settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Content & SEO Management</h2>
            <p className="text-gray-600">Edit text, fonts, sizes, colors, and SEO descriptions across the site</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                Save All Changes
              </>
            )}
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeCategory === cat
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Settings by Page */}
        <div className="space-y-8">
          {Object.entries(groupedByPage).map(([page, settings]) => (
            <div key={page} className="border border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 capitalize">
                {page === '/' ? 'Home Page' : page === 'global' ? 'Global Settings' : page.replace('/', '').replace('-', ' ')}
              </h3>
              
              <div className="space-y-4">
                {settings.map(setting => (
                  <div key={setting.id} className="border-l-4 border-primary-500 pl-4 py-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      {setting.label}
                      {setting.description && (
                        <span className="text-xs font-normal text-gray-500 ml-2">({setting.description})</span>
                      )}
                    </label>
                    
                    {setting.setting_type === 'color' ? (
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={editedValues[setting.setting_key] || setting.value}
                          onChange={(e) => handleValueChange(setting.setting_key, e.target.value)}
                          className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={editedValues[setting.setting_key] || setting.value}
                          onChange={(e) => handleValueChange(setting.setting_key, e.target.value)}
                          className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder={setting.value}
                        />
                      </div>
                    ) : setting.setting_type === 'image_url' ? (
                      <div className="space-y-3">
                        {imagePreviews[setting.setting_key] && (
                          <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                            <img 
                              src={imagePreviews[setting.setting_key]} 
                              alt="Background preview" 
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveBackgroundImage(setting.setting_key)}
                              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            onChange={(e) => handleBackgroundImageUpload(e, setting.setting_key)}
                            disabled={uploadingImages[setting.setting_key]}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          {uploadingImages[setting.setting_key] && (
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                              <Loader2 className="w-5 h-5 animate-spin text-red-600" />
                            </div>
                          )}
                        </div>
                        <input
                          type="text"
                          value={editedValues[setting.setting_key] || setting.value}
                          onChange={(e) => handleValueChange(setting.setting_key, e.target.value)}
                          placeholder="Or enter image URL directly"
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                        <p className="text-xs text-gray-500">Max size: 5MB. Recommended: 1920x1080px or larger for backgrounds</p>
                      </div>
                    ) : setting.setting_type === 'font_size' ? (
                      <input
                        type="text"
                        value={editedValues[setting.setting_key] || setting.value}
                        onChange={(e) => handleValueChange(setting.setting_key, e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="e.g., text-xl sm:text-2xl md:text-3xl"
                      />
                    ) : (
                      <textarea
                        value={editedValues[setting.setting_key] || setting.value}
                        onChange={(e) => handleValueChange(setting.setting_key, e.target.value)}
                        rows={setting.setting_type === 'seo' || setting.setting_type === 'description' ? 3 : 2}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-y"
                        placeholder={setting.value}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
