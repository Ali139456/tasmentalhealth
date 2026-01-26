import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { sendEmail, getEmailTemplate, getAdminEmails } from '../lib/email'
import { LOCATIONS, PROFESSIONS, SPECIALTIES, PRACTICE_TYPES } from '../lib/constants'
import { AlertCircle, CheckCircle, ArrowLeft, Phone, Mail, Globe, Sparkles, ArrowRight } from 'lucide-react'

export function GetListed() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    practice_name: '',
    email: user?.email || '',
    phone: '',
    website: '',
    profession: '',
    practice_type: 'individual' as 'individual' | 'group_practice' | 'non_profit',
    ahpra_number: '',
    specialties: [] as string[],
    location: '',
    postcode: '',
    street_address: '',
    is_telehealth: false,
    is_rural_outreach: false,
    is_statewide_telehealth: false,
    bio: '',
    avatar_url: '',
    show_name_publicly: true,
    show_email_publicly: false,
    show_phone_publicly: false,
    show_website_publicly: true,
  })
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!user) {
        const tempPassword = Math.random().toString(36).slice(-12) + 'A1!'
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: tempPassword,
        })

        if (authError) throw authError

        await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}/reset-password`,
        })

        // Prepare listing data, excluding avatar_url (column doesn't exist in database)
        const { avatar_url, ...listingData } = formData
        const insertData = {
          user_id: authData.user?.id,
          ...listingData
        }

        const { error: listingError } = await supabase
          .from('listings')
          .insert(insertData)

        if (listingError) throw listingError

        // Send lister account creation email
        try {
          const listerTemplate = getEmailTemplate('lister_account_created', {
            email: formData.email,
            userName: formData.email.split('@')[0],
            listingName: formData.practice_name,
            temporaryPassword: tempPassword,
            appUrl: window.location.origin
          })
          await sendEmail({
            to: formData.email,
            subject: listerTemplate.subject,
            html: listerTemplate.html
          })
        } catch (emailErr) {
          console.error('Failed to send lister account email:', emailErr)
        }

        // Send listing submitted email
        try {
          const listingTemplate = getEmailTemplate('listing_submitted', {
            email: formData.email,
            userName: formData.email.split('@')[0],
            listingName: formData.practice_name,
            appUrl: window.location.origin
          })
          await sendEmail({
            to: formData.email,
            subject: listingTemplate.subject,
            html: listingTemplate.html
          })
        } catch (emailErr) {
          console.error('Failed to send listing submitted email:', emailErr)
        }

        // Send admin notification
        try {
          const adminEmails = await getAdminEmails()
          if (adminEmails.length > 0) {
            const adminTemplate = getEmailTemplate('admin_listing_submitted', {
              practiceName: formData.practice_name,
              profession: formData.profession,
              location: `${formData.location}, ${formData.postcode}`,
              userEmail: formData.email,
              submissionDate: new Date().toLocaleString('en-AU', { timeZone: 'Australia/Hobart' })
            })

            await Promise.all(adminEmails.map(adminEmail => 
              sendEmail({
                to: adminEmail,
                subject: adminTemplate.subject,
                html: adminTemplate.html
              })
            ))
            console.log('Admin notification sent for new listing')
          }
        } catch (err) {
          console.error('Error sending admin notification:', err)
          // Don't fail listing submission if admin notification fails
        }

        setSuccess(true)
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        // Prepare listing data, excluding avatar_url (column doesn't exist in database)
        const { avatar_url, ...listingData } = formData
        const insertData = {
          user_id: user.id,
          ...listingData
        }

        const { error: listingError } = await supabase
          .from('listings')
          .insert(insertData)

        if (listingError) throw listingError

        // Send listing submitted email for existing users
        try {
          const listingTemplate = getEmailTemplate('listing_submitted', {
            email: user.email || formData.email,
            userName: user.email?.split('@')[0] || formData.email.split('@')[0],
            listingName: formData.practice_name,
            appUrl: window.location.origin
          })
          await sendEmail({
            to: user.email || formData.email,
            subject: listingTemplate.subject,
            html: listingTemplate.html
          })
        } catch (emailErr) {
          console.error('Failed to send listing submitted email:', emailErr)
        }

        // Send admin notification
        try {
          const adminEmails = await getAdminEmails()
          if (adminEmails.length > 0) {
            const adminTemplate = getEmailTemplate('admin_listing_submitted', {
              practiceName: formData.practice_name,
              profession: formData.profession,
              location: `${formData.location}, ${formData.postcode}`,
              userEmail: user.email || formData.email,
              submissionDate: new Date().toLocaleString('en-AU', { timeZone: 'Australia/Hobart' })
            })

            await Promise.all(adminEmails.map(adminEmail => 
              sendEmail({
                to: adminEmail,
                subject: adminTemplate.subject,
                html: adminTemplate.html
              })
            ))
            console.log('Admin notification sent for new listing')
          }
        } catch (err) {
          console.error('Error sending admin notification:', err)
          // Don't fail listing submission if admin notification fails
        }

        setSuccess(true)
        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit listing')
    } finally {
      setLoading(false)
    }
  }

  const toggleSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }))
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    setUploadingAvatar(true)
    setError('')

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

      setFormData(prev => ({ ...prev, avatar_url: publicUrl }))
    } catch (err: any) {
      console.error('Error uploading avatar:', err)
      setError(err.message || 'Failed to upload avatar')
      setAvatarPreview(null)
    } finally {
      setUploadingAvatar(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-100/50"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-12 text-center relative z-10 border border-primary-100">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Application Submitted!</h2>
          <p className="text-gray-600 mb-6 text-lg">
            {user
              ? 'Your listing has been submitted for review. You will receive an email once it\'s been reviewed.'
              : 'Your account has been created and your listing has been submitted. Please check your email to set your password.'}
          </p>
          <div className="flex items-center justify-center gap-2 text-primary-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
            <p className="text-sm font-medium">Redirecting you...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with gradient and decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-100/30"></div>
      
      {/* Decorative blur shapes */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary-400/15 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary-500/15 rounded-full blur-3xl"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary-300/10 rounded-full blur-3xl"></div>
      
      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2339B8A6' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative z-10 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Back to Home Button */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>

          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Join the Tasmanian Mental Health Directory
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Register your practice to connect with patients across Tasmania
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-primary-400 mx-auto rounded-full"></div>
            {!user && (
              <p className="mt-6 text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                  Log in here
                </Link>
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-xl mb-8 flex items-start gap-3 shadow-lg">
              <AlertCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Contact Information */}
            <section className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-xl border border-primary-100/50">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Practice / Provider Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.practice_name}
                    onChange={(e) => setFormData({ ...formData, practice_name: e.target.value })}
                    placeholder="e.g. Dr. Jane Smith Psychology"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={!!user}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 transition-all bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(03) 6234 5678"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Website
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="www.example.com.au"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Public Visibility Settings */}
            <section className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-xl border border-primary-100/50">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Public Visibility Settings</h2>
              <p className="text-sm text-gray-600 mb-6">
                Choose which contact details you want to be publicly visible on your listing.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-primary-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.show_name_publicly}
                    onChange={(e) => setFormData({ ...formData, show_name_publicly: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Show Name Publicly</span>
                </label>

                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-primary-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.show_email_publicly}
                    onChange={(e) => setFormData({ ...formData, show_email_publicly: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Show Email Publicly</span>
                </label>

                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-primary-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.show_phone_publicly}
                    onChange={(e) => setFormData({ ...formData, show_phone_publicly: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Show Phone Publicly</span>
                </label>

                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-primary-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.show_website_publicly}
                    onChange={(e) => setFormData({ ...formData, show_website_publicly: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Show Website Publicly</span>
                </label>
              </div>
            </section>

            {/* Professional Details */}
            <section className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-xl border border-primary-100/50">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Details</h2>
              <div className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Profession *
                    </label>
                    <select
                      required
                      value={formData.profession}
                      onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                    >
                      <option value="">Select profession...</option>
                      {PROFESSIONS.map(prof => (
                        <option key={prof} value={prof}>{prof}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Practice Type *
                    </label>
                    <select
                      required
                      value={formData.practice_type}
                      onChange={(e) => setFormData({ ...formData, practice_type: e.target.value as any })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                    >
                      {PRACTICE_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    AHPRA / Registration Number
                  </label>
                  <input
                    type="text"
                    value={formData.ahpra_number}
                    onChange={(e) => setFormData({ ...formData, ahpra_number: e.target.value })}
                    placeholder="e.g. PSY0001234567"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                  />
                </div>
              </div>
            </section>

            {/* Services & Availability */}
            <section className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-xl border border-primary-100/50">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Services & Availability</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Specialties *
                  </label>
                  <div className="border-2 border-gray-200 rounded-xl p-5 max-h-64 overflow-y-auto bg-white">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {SPECIALTIES.map(spec => (
                        <label key={spec} className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-primary-50 transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.specialties.includes(spec)}
                            onChange={() => toggleSpecialty(spec)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700">{spec}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.is_telehealth}
                      onChange={(e) => setFormData({ ...formData, is_telehealth: e.target.checked })}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Telehealth Available</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.is_rural_outreach}
                      onChange={(e) => setFormData({ ...formData, is_rural_outreach: e.target.checked })}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Rural Outreach</span>
                  </label>
                </div>
              </div>
            </section>

            {/* Location */}
            <section className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-xl border border-primary-100/50">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Location & Details</h2>
              <div className="space-y-5">
                <label className="flex items-center space-x-2 cursor-pointer px-4 py-3 rounded-lg hover:bg-primary-50 transition-colors border-2 border-gray-200">
                  <input
                    type="checkbox"
                    checked={formData.is_statewide_telehealth}
                    onChange={(e) => setFormData({ ...formData, is_statewide_telehealth: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">I provide Statewide services via Telehealth</span>
                </label>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Street Address (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.street_address}
                    onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
                    placeholder="Level 1, 123 Example St"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Location (City/Suburb) *
                    </label>
                    <select
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                    >
                      <option value="">Select location...</option>
                      {LOCATIONS.filter(loc => loc !== 'All Locations').map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Postcode *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.postcode}
                      onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                      placeholder="7000"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Professional Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Describe your approach, experience, and what clients can expect..."
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white resize-none"
                  />
                </div>

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
                            setFormData(prev => ({ ...prev, avatar_url: '' }))
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
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Upload a square image (recommended: 400x400px). Max size: 5MB. Only featured listings will display this avatar.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
              <p className="text-sm text-gray-500 text-center sm:text-left">
                By submitting, you agree to our Terms of Service.
              </p>
              <button
                type="submit"
                disabled={loading}
                className="group px-8 py-4 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Submit Application</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
