import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { Listing, User, Subscription } from '../types'
import { CheckCircle, XCircle, Clock, AlertCircle, Search, Mail, Phone } from 'lucide-react'
import { format } from 'date-fns'
import { sendEmail, getEmailTemplate } from '../lib/email'

export function Admin() {
  const { user } = useAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'listings' | 'users' | 'subscriptions'>('listings')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user, activeTab])

  const fetchData = async () => {
    try {
      if (activeTab === 'listings') {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setListings(data || [])
      } else if (activeTab === 'users') {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setUsers(data || [])
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
            userName: userData.email,
            listingName: listing.practice_name,
            reason: notes,
            notes: notes,
            dashboardUrl: `${window.location.origin}/dashboard`
          })

          await sendEmail({
            to: userData.email,
            subject: template.subject,
            html: template.html
          })
        }
      }

      await fetchData()
      alert(`Listing ${action}d successfully!`)
    } catch (error: any) {
      console.error('Error updating listing:', error)
      alert(`Failed to ${action} listing: ${error.message}`)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage listings, users, and subscriptions</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'listings'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Listings ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'users'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'subscriptions'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Subscriptions
          </button>
        </div>

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div>
            <div className="mb-6 flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search listings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Practice Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredListings.map(listing => (
                      <tr key={listing.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{listing.practice_name}</div>
                          <div className="text-sm text-gray-500">{listing.profession}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {listing.email}
                          </div>
                          {listing.phone && (
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <Phone className="w-4 h-4 mr-1" />
                              {listing.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {listing.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(listing.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(listing.created_at), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            {listing.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleListingAction(listing.id, 'approve')}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = prompt('Rejection reason:')
                                    if (reason) handleListingAction(listing.id, 'reject', reason)
                                  }}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => {
                                    const notes = prompt('Required changes:')
                                    if (notes) handleListingAction(listing.id, 'needs_changes', notes)
                                  }}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Needs Changes
                                </button>
                              </>
                            )}
                            {listing.status === 'needs_changes' && (
                              <button
                                onClick={() => handleListingAction(listing.id, 'approve')}
                                className="text-green-600 hover:text-green-900"
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
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email Verified</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map(userItem => (
                    <tr key={userItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {userItem.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {userItem.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {userItem.email_verified ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Verified
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(userItem.created_at), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600">Subscription management coming soon...</p>
          </div>
        )}
      </div>
    </div>
  )
}
