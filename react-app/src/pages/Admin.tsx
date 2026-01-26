import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { Listing, User } from '../types'
import { CheckCircle, XCircle, Clock, AlertCircle, Search, Mail, Phone, ChevronLeft, ChevronRight, Trash2, Loader2, FileText, X, Plus, Edit } from 'lucide-react'
import { format } from 'date-fns'
import { sendEmail, getEmailTemplate } from '../lib/email'
import toast from 'react-hot-toast'

const ITEMS_PER_PAGE = 10

export function Admin() {
  const { user, role } = useAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'listings' | 'users' | 'subscriptions' | 'articles'>('listings')
  const [articles, setArticles] = useState<any[]>([])
  const [counts, setCounts] = useState({ listings: 0, users: 0, articles: 0 })
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
  const [currentListingsPage, setCurrentListingsPage] = useState(1)
  const [currentUsersPage, setCurrentUsersPage] = useState(1)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)

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
      fetchData()
    }
  }, [activeTab])

  // Fetch counts for all tabs on initial load
  const fetchCounts = async () => {
    try {
      const [listingsResult, usersResult, articlesResult] = await Promise.all([
        supabase.from('listings').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('resources').select('id', { count: 'exact', head: true })
      ])

      setCounts({
        listings: listingsResult.count ?? 0,
        users: usersResult.count ?? 0,
        articles: articlesResult.count ?? 0
      })
    } catch (error) {
      console.error('Error fetching counts:', error)
      // Fallback: if count query fails, use length of fetched data
      setCounts({
        listings: listings.length,
        users: users.length,
        articles: articles.length
      })
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
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
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

  const handleUpdateUserRole = async (userId: string, newRole: 'admin' | 'lister' | 'public') => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error
      await fetchData()
      await fetchCounts()
      setEditingUserId(null)
      toast.success('User role updated successfully!')
    } catch (error: any) {
      console.error('Error updating user role:', error)
      toast.error(`Failed to update user role: ${error.message}`)
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

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setUploadingImage(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `articles/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = fileName

      const { error: uploadError } = await supabase.storage
        .from('listings')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('listings')
        .getPublicUrl(filePath)

      setArticleFormData(prev => ({ ...prev, image_url: publicUrl }))
      setImagePreview(publicUrl)
      toast.success('Image uploaded successfully')
    } catch (err: any) {
      console.error('Error uploading image:', err)
      toast.error(err.message || 'Failed to upload image')
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
        const { data: existing } = await supabase
          .from('resources')
          .select('id')
          .eq('slug', slug)
          .neq('id', editingArticleId)
          .single()

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
        const { data: existing } = await supabase
          .from('resources')
          .select('id')
          .eq('slug', slug)
          .single()

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

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({ userId }),
      })

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

      // Response is successful, no need to parse JSON
      await fetchData()
      await fetchCounts()
      toast.success('User deleted successfully!', { id: deleteToast })
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
            onClick={() => setActiveTab('listings')}
            className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all ${
              activeTab === 'listings'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Listings ({counts.listings})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all ${
              activeTab === 'users'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Users ({counts.users})
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all ${
              activeTab === 'subscriptions'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Subscriptions
          </button>
          <button
            onClick={() => setActiveTab('articles')}
            className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all ${
              activeTab === 'articles'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Articles ({counts.articles})
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
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {userItem.email}
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
                          {userItem.email_verified ? (
                            <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-green-100 text-green-800">
                              Verified
                            </span>
                          ) : (
                            <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {format(new Date(userItem.created_at), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex items-center gap-2">
                            {editingUserId === userItem.id ? (
                              <>
                                <button
                                  onClick={() => handleUpdateUserRole(userItem.id, editingRole)}
                                  className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-semibold text-xs"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingUserId(null)
                                    setEditingRole('lister')
                                  }}
                                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-xs"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingUserId(userItem.id)
                                    setEditingRole(userItem.role as 'admin' | 'lister' | 'public')
                                  }}
                                  className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-semibold text-xs"
                                >
                                  Edit Role
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
      </div>
    </div>
  )
}
