import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { sendEmail, getEmailTemplate, getAdminEmails } from '../lib/email'
import { LOCATIONS, PROFESSIONS, SPECIALTIES, PRACTICE_TYPES } from '../lib/constants'
import { sanitizeInput } from '../lib/sanitize'
import { AlertCircle, CheckCircle, ArrowLeft, Phone, Mail, Globe, Sparkles, ArrowRight, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { useContentSettings } from '../hooks/useContentSettings'
import { SEO } from '../components/SEO'

// Complete list of all country codes for phone numbers
const COUNTRY_CODES = [
  { code: '+1', country: 'United States/Canada', flag: '🇺🇸' },
  { code: '+7', country: 'Russia/Kazakhstan', flag: '🇷🇺' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+30', country: 'Greece', flag: '🇬🇷' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+36', country: 'Hungary', flag: '🇭🇺' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+40', country: 'Romania', flag: '🇷🇴' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
  { code: '+43', country: 'Austria', flag: '🇦🇹' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+45', country: 'Denmark', flag: '🇩🇰' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪' },
  { code: '+47', country: 'Norway', flag: '🇳🇴' },
  { code: '+48', country: 'Poland', flag: '🇵🇱' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+51', country: 'Peru', flag: '🇵🇪' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽' },
  { code: '+53', country: 'Cuba', flag: '🇨🇺' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+90', country: 'Turkey', flag: '🇹🇷' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
  { code: '+93', country: 'Afghanistan', flag: '🇦🇫' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+95', country: 'Myanmar', flag: '🇲🇲' },
  { code: '+98', country: 'Iran', flag: '🇮🇷' },
  { code: '+212', country: 'Morocco', flag: '🇲🇦' },
  { code: '+213', country: 'Algeria', flag: '🇩🇿' },
  { code: '+216', country: 'Tunisia', flag: '🇹🇳' },
  { code: '+218', country: 'Libya', flag: '🇱🇾' },
  { code: '+220', country: 'Gambia', flag: '🇬🇲' },
  { code: '+221', country: 'Senegal', flag: '🇸🇳' },
  { code: '+222', country: 'Mauritania', flag: '🇲🇷' },
  { code: '+223', country: 'Mali', flag: '🇲🇱' },
  { code: '+224', country: 'Guinea', flag: '🇬🇳' },
  { code: '+225', country: 'Ivory Coast', flag: '🇨🇮' },
  { code: '+226', country: 'Burkina Faso', flag: '🇧🇫' },
  { code: '+227', country: 'Niger', flag: '🇳🇪' },
  { code: '+228', country: 'Togo', flag: '🇹🇬' },
  { code: '+229', country: 'Benin', flag: '🇧🇯' },
  { code: '+230', country: 'Mauritius', flag: '🇲🇺' },
  { code: '+231', country: 'Liberia', flag: '🇱🇷' },
  { code: '+232', country: 'Sierra Leone', flag: '🇸🇱' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+235', country: 'Chad', flag: '🇹🇩' },
  { code: '+236', country: 'Central African Republic', flag: '🇨🇫' },
  { code: '+237', country: 'Cameroon', flag: '🇨🇲' },
  { code: '+238', country: 'Cape Verde', flag: '🇨🇻' },
  { code: '+239', country: 'São Tomé and Príncipe', flag: '🇸🇹' },
  { code: '+240', country: 'Equatorial Guinea', flag: '🇬🇶' },
  { code: '+241', country: 'Gabon', flag: '🇬🇦' },
  { code: '+242', country: 'Republic of the Congo', flag: '🇨🇬' },
  { code: '+243', country: 'DR Congo', flag: '🇨🇩' },
  { code: '+244', country: 'Angola', flag: '🇦🇴' },
  { code: '+245', country: 'Guinea-Bissau', flag: '🇬🇼' },
  { code: '+246', country: 'British Indian Ocean Territory', flag: '🇮🇴' },
  { code: '+248', country: 'Seychelles', flag: '🇸🇨' },
  { code: '+249', country: 'Sudan', flag: '🇸🇩' },
  { code: '+250', country: 'Rwanda', flag: '🇷🇼' },
  { code: '+251', country: 'Ethiopia', flag: '🇪🇹' },
  { code: '+252', country: 'Somalia', flag: '🇸🇴' },
  { code: '+253', country: 'Djibouti', flag: '🇩🇯' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+255', country: 'Tanzania', flag: '🇹🇿' },
  { code: '+256', country: 'Uganda', flag: '🇺🇬' },
  { code: '+257', country: 'Burundi', flag: '🇧🇮' },
  { code: '+258', country: 'Mozambique', flag: '🇲🇿' },
  { code: '+260', country: 'Zambia', flag: '🇿🇲' },
  { code: '+261', country: 'Madagascar', flag: '🇲🇬' },
  { code: '+262', country: 'Réunion', flag: '🇷🇪' },
  { code: '+263', country: 'Zimbabwe', flag: '🇿🇼' },
  { code: '+264', country: 'Namibia', flag: '🇳🇦' },
  { code: '+265', country: 'Malawi', flag: '🇲🇼' },
  { code: '+266', country: 'Lesotho', flag: '🇱🇸' },
  { code: '+267', country: 'Botswana', flag: '🇧🇼' },
  { code: '+268', country: 'Eswatini', flag: '🇸🇿' },
  { code: '+269', country: 'Comoros', flag: '🇰🇲' },
  { code: '+290', country: 'Saint Helena', flag: '🇸🇭' },
  { code: '+291', country: 'Eritrea', flag: '🇪🇷' },
  { code: '+297', country: 'Aruba', flag: '🇦🇼' },
  { code: '+298', country: 'Faroe Islands', flag: '🇫🇴' },
  { code: '+299', country: 'Greenland', flag: '🇬🇱' },
  { code: '+350', country: 'Gibraltar', flag: '🇬🇮' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+352', country: 'Luxembourg', flag: '🇱🇺' },
  { code: '+353', country: 'Ireland', flag: '🇮🇪' },
  { code: '+354', country: 'Iceland', flag: '🇮🇸' },
  { code: '+355', country: 'Albania', flag: '🇦🇱' },
  { code: '+356', country: 'Malta', flag: '🇲🇹' },
  { code: '+357', country: 'Cyprus', flag: '🇨🇾' },
  { code: '+358', country: 'Finland', flag: '🇫🇮' },
  { code: '+359', country: 'Bulgaria', flag: '🇧🇬' },
  { code: '+370', country: 'Lithuania', flag: '🇱🇹' },
  { code: '+371', country: 'Latvia', flag: '🇱🇻' },
  { code: '+372', country: 'Estonia', flag: '🇪🇪' },
  { code: '+373', country: 'Moldova', flag: '🇲🇩' },
  { code: '+374', country: 'Armenia', flag: '🇦🇲' },
  { code: '+375', country: 'Belarus', flag: '🇧🇾' },
  { code: '+376', country: 'Andorra', flag: '🇦🇩' },
  { code: '+377', country: 'Monaco', flag: '🇲🇨' },
  { code: '+378', country: 'San Marino', flag: '🇸🇲' },
  { code: '+380', country: 'Ukraine', flag: '🇺🇦' },
  { code: '+381', country: 'Serbia', flag: '🇷🇸' },
  { code: '+382', country: 'Montenegro', flag: '🇲🇪' },
  { code: '+383', country: 'Kosovo', flag: '🇽🇰' },
  { code: '+385', country: 'Croatia', flag: '🇭🇷' },
  { code: '+386', country: 'Slovenia', flag: '🇸🇮' },
  { code: '+387', country: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  { code: '+389', country: 'North Macedonia', flag: '🇲🇰' },
  { code: '+420', country: 'Czech Republic', flag: '🇨🇿' },
  { code: '+421', country: 'Slovakia', flag: '🇸🇰' },
  { code: '+423', country: 'Liechtenstein', flag: '🇱🇮' },
  { code: '+500', country: 'Falkland Islands', flag: '🇫🇰' },
  { code: '+501', country: 'Belize', flag: '🇧🇿' },
  { code: '+502', country: 'Guatemala', flag: '🇬🇹' },
  { code: '+503', country: 'El Salvador', flag: '🇸🇻' },
  { code: '+504', country: 'Honduras', flag: '🇭🇳' },
  { code: '+505', country: 'Nicaragua', flag: '🇳🇮' },
  { code: '+506', country: 'Costa Rica', flag: '🇨🇷' },
  { code: '+507', country: 'Panama', flag: '🇵🇦' },
  { code: '+508', country: 'Saint Pierre and Miquelon', flag: '🇵🇲' },
  { code: '+509', country: 'Haiti', flag: '🇭🇹' },
  { code: '+590', country: 'Guadeloupe', flag: '🇬🇵' },
  { code: '+591', country: 'Bolivia', flag: '🇧🇴' },
  { code: '+592', country: 'Guyana', flag: '🇬🇾' },
  { code: '+593', country: 'Ecuador', flag: '🇪🇨' },
  { code: '+594', country: 'French Guiana', flag: '🇬🇫' },
  { code: '+595', country: 'Paraguay', flag: '🇵🇾' },
  { code: '+596', country: 'Martinique', flag: '🇲🇶' },
  { code: '+597', country: 'Suriname', flag: '🇸🇷' },
  { code: '+598', country: 'Uruguay', flag: '🇺🇾' },
  { code: '+599', country: 'Netherlands Antilles', flag: '🇧🇶' },
  { code: '+670', country: 'East Timor', flag: '🇹🇱' },
  { code: '+672', country: 'Antarctica', flag: '🇦🇶' },
  { code: '+673', country: 'Brunei', flag: '🇧🇳' },
  { code: '+674', country: 'Nauru', flag: '🇳🇷' },
  { code: '+675', country: 'Papua New Guinea', flag: '🇵🇬' },
  { code: '+676', country: 'Tonga', flag: '🇹🇴' },
  { code: '+677', country: 'Solomon Islands', flag: '🇸🇧' },
  { code: '+678', country: 'Vanuatu', flag: '🇻🇺' },
  { code: '+679', country: 'Fiji', flag: '🇫🇯' },
  { code: '+680', country: 'Palau', flag: '🇵🇼' },
  { code: '+681', country: 'Wallis and Futuna', flag: '🇼🇫' },
  { code: '+682', country: 'Cook Islands', flag: '🇨🇰' },
  { code: '+683', country: 'Niue', flag: '🇳🇺' },
  { code: '+685', country: 'Samoa', flag: '🇼🇸' },
  { code: '+686', country: 'Kiribati', flag: '🇰🇮' },
  { code: '+687', country: 'New Caledonia', flag: '🇳🇨' },
  { code: '+688', country: 'Tuvalu', flag: '🇹🇻' },
  { code: '+689', country: 'French Polynesia', flag: '🇵🇫' },
  { code: '+690', country: 'Tokelau', flag: '🇹🇰' },
  { code: '+691', country: 'Micronesia', flag: '🇫🇲' },
  { code: '+692', country: 'Marshall Islands', flag: '🇲🇭' },
  { code: '+850', country: 'North Korea', flag: '🇰🇵' },
  { code: '+852', country: 'Hong Kong', flag: '🇭🇰' },
  { code: '+853', country: 'Macau', flag: '🇲🇴' },
  { code: '+855', country: 'Cambodia', flag: '🇰🇭' },
  { code: '+856', country: 'Laos', flag: '🇱🇦' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
  { code: '+886', country: 'Taiwan', flag: '🇹🇼' },
  { code: '+960', country: 'Maldives', flag: '🇲🇻' },
  { code: '+961', country: 'Lebanon', flag: '🇱🇧' },
  { code: '+962', country: 'Jordan', flag: '🇯🇴' },
  { code: '+963', country: 'Syria', flag: '🇸🇾' },
  { code: '+964', country: 'Iraq', flag: '🇮🇶' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+967', country: 'Yemen', flag: '🇾🇪' },
  { code: '+968', country: 'Oman', flag: '🇴🇲' },
  { code: '+970', country: 'Palestine', flag: '🇵🇸' },
  { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪' },
  { code: '+972', country: 'Israel', flag: '🇮🇱' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' },
  { code: '+975', country: 'Bhutan', flag: '🇧🇹' },
  { code: '+976', country: 'Mongolia', flag: '🇲🇳' },
  { code: '+977', country: 'Nepal', flag: '🇳🇵' },
  { code: '+992', country: 'Tajikistan', flag: '🇹🇯' },
  { code: '+993', country: 'Turkmenistan', flag: '🇹🇲' },
  { code: '+994', country: 'Azerbaijan', flag: '🇦🇿' },
  { code: '+995', country: 'Georgia', flag: '🇬🇪' },
  { code: '+996', country: 'Kyrgyzstan', flag: '🇰🇬' },
  { code: '+998', country: 'Uzbekistan', flag: '🇺🇿' },
]

// Phone number validation
const validatePhoneNumber = (phone: string, countryCode: string): boolean => {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '')
  
  // Remove leading 0 if present (common in Australian numbers)
  const cleanPhone = digitsOnly.startsWith('0') ? digitsOnly.slice(1) : digitsOnly
  
  // Basic validation based on country code
  switch (countryCode) {
    case '+61': // Australia
      // Australian numbers: 9 digits after country code (without leading 0)
      return cleanPhone.length >= 8 && cleanPhone.length <= 10 && /^[2-9]/.test(cleanPhone)
    case '+1': // US/Canada
      return cleanPhone.length === 10 && /^[2-9]\d{2}[2-9]\d{2}\d{4}$/.test(cleanPhone)
    case '+44': // UK
      return cleanPhone.length >= 9 && cleanPhone.length <= 10
    case '+64': // New Zealand
      return cleanPhone.length >= 8 && cleanPhone.length <= 9
    default:
      // Generic validation: 7-15 digits
      return cleanPhone.length >= 7 && cleanPhone.length <= 15
  }
}

export function GetListed() {
  const { settings } = useContentSettings()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [phoneCountryCode, setPhoneCountryCode] = useState('+61')
  const [phoneError, setPhoneError] = useState('')

  const [formData, setFormData] = useState({
    practice_name: '',
    email: user?.email || '',
    phone: '',
    website: '',
    profession: '',
    profession_other: '', // For "Other" profession option
    practice_type: 'individual' as 'individual' | 'group_practice' | 'non_profit',
    ahpra_number: '',
    accredited_member_number: '',
    verification_document_url: '',
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
  const [verificationDocumentPreview, setVerificationDocumentPreview] = useState<string | null>(null)
  const [uploadingVerification, setUploadingVerification] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false)

  // Auto-fill email when user changes (but allow editing)
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => {
        // Only update if email field is empty or matches the previous user email
        // This allows user to edit while still auto-filling on initial load
        if (!prev.email || prev.email === user.email) {
          return { ...prev, email: user.email || '' }
        }
        return prev
      })
    }
  }, [user?.email])

  const handlePhoneChange = (value: string) => {
    // Remove all non-digit characters except spaces, dashes, and parentheses
    const cleaned = value.replace(/[^\d\s\-()]/g, '')
    setFormData({ ...formData, phone: cleaned })
    setPhoneError('')
    
    // Validate on blur or when user stops typing
    if (cleaned.length > 0) {
      const isValid = validatePhoneNumber(cleaned, phoneCountryCode)
      if (!isValid && cleaned.replace(/\D/g, '').length >= 4) {
        setPhoneError('Please enter a valid phone number')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setPhoneError('')
    setLoading(true)

    // CRITICAL: User must be logged in first before submitting listing
    if (!user) {
      toast.error('Please create your user account first. Redirecting to sign up...')
      setLoading(false)
      // Redirect to login page after a short delay to show the toast
      setTimeout(() => {
        navigate('/login?redirect=/get-listed')
      }, 1500)
      return
    }

    // Validate that user has agreed to terms and privacy policy
    if (!agreedToTerms || !agreedToPrivacy) {
      setError('Please agree to our Terms and Conditions and Privacy Policy to continue.')
      setLoading(false)
      return
    }

    // SECURITY: Sanitize all text inputs before submission
    const sanitizedFormData = {
      ...formData,
      practice_name: sanitizeInput(formData.practice_name),
      email: formData.email.trim().toLowerCase(), // Email is validated separately
      phone: formData.phone.trim(),
      website: formData.website.trim(),
      profession: sanitizeInput(formData.profession),
      profession_other: sanitizeInput(formData.profession_other),
      ahpra_number: sanitizeInput(formData.ahpra_number),
      accredited_member_number: sanitizeInput(formData.accredited_member_number),
      verification_document_url: formData.verification_document_url,
      location: sanitizeInput(formData.location),
      postcode: sanitizeInput(formData.postcode),
      street_address: sanitizeInput(formData.street_address),
      bio: sanitizeInput(formData.bio)
    }

    // Validate phone number before submission
    if (sanitizedFormData.phone) {
      const isValid = validatePhoneNumber(sanitizedFormData.phone, phoneCountryCode)
      if (!isValid) {
        setPhoneError('Please enter a valid phone number')
        setLoading(false)
        return
      }
    }

    // Validate address fields - only required if NOT telehealth only
    if (!sanitizedFormData.is_statewide_telehealth) {
      if (!sanitizedFormData.location || !sanitizedFormData.postcode) {
        setError('Location and postcode are required unless you provide Statewide Telehealth services only')
        setLoading(false)
        return
      }
    }

    // Validate profession - if "Other" is selected, require profession_other
    if (sanitizedFormData.profession === 'Other' && !sanitizedFormData.profession_other.trim()) {
      setError('Please specify your profession')
      setLoading(false)
      return
    }

    try {
      // User must be logged in at this point (checked above)
      if (!user?.id) {
        toast.error('Please create your user account first. Redirecting to sign up...')
        setLoading(false)
        setTimeout(() => {
          navigate('/login?redirect=/get-listed')
        }, 1500)
        return
      }

      // CRITICAL: Ensure user exists in public.users table before inserting listing
      // The database trigger should create this, but we'll ensure it exists to prevent RLS errors
      const userId = user.id
      let userExists = false
      let retries = 0
      const maxRetries = 5

      while (!userExists && retries < maxRetries) {
        // Check if user exists in public.users
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', userId)
          .maybeSingle()

        if (existingUser) {
          userExists = true
          break
        }

        // If user doesn't exist, try to create it
        const { error: createUserError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: user.email || sanitizedFormData.email,
            role: 'lister',
            email_verified: false
          })

        if (!createUserError) {
          userExists = true
          break
        }

        // If insert failed due to conflict (user was created by trigger), check again
        if (createUserError.code === '23505') { // Unique violation - user exists now
          userExists = true
          break
        }

        // Wait a bit before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 200 * Math.pow(2, retries)))
        retries++
      }

      if (!userExists) {
        toast.error('Please create your user account first.')
        setError('Failed to create user record. Please try again or contact support.')
        setLoading(false)
        return
      }

      // Prepare listing data, including avatar_url
      // Format phone number with country code
      const formattedPhone = sanitizedFormData.phone ? `${phoneCountryCode} ${sanitizedFormData.phone}` : ''
      // Use profession_other if "Other" is selected, otherwise use profession
      const finalProfession = sanitizedFormData.profession === 'Other' ? sanitizedFormData.profession_other : sanitizedFormData.profession
      const { profession_other, ...dataWithoutOther } = sanitizedFormData
      const insertData = {
        user_id: userId,
        ...dataWithoutOther,
        profession: finalProfession,
        phone: formattedPhone
      }

      const { error: listingError } = await supabase
        .from('listings')
        .insert(insertData)

      if (listingError) {
        // If RLS error, provide helpful message
        if (listingError.code === '42501' || listingError.message?.includes('row-level security')) {
          toast.error('Please create your user account first.')
          setError('Permission denied. Please ensure your account is properly set up. If this error persists, please contact support.')
          setLoading(false)
          return
        }
        throw listingError
      }

      // Send listing submitted email
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
      toast.success('Your listing has been submitted successfully!')
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
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

    // SECURITY: Validate file type - only allow specific image MIME types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)')
      return
    }

    // SECURITY: Validate file extension matches MIME type
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    if (!fileExt || !validExtensions.includes(fileExt)) {
      setError('Invalid file extension. Please upload a valid image file.')
      return
    }

    // SECURITY: Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    // SECURITY: Validate minimum file size (prevent empty or corrupted files)
    if (file.size < 100) {
      setError('File appears to be corrupted or empty')
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

      // Upload to Supabase Storage - use listings bucket (same as Dashboard)
      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id || 'temp'}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Try listings bucket first (standard bucket for this app)
      let bucketName = 'listings'
      let uploadError = null

      const { error: listingsError } = await supabase.storage
        .from('listings')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (listingsError) {
        // If bucket doesn't exist or has permission issues, try Articles bucket (used by Admin)
        if (listingsError.message?.includes('not found') || listingsError.message?.includes('Bucket') || listingsError.message?.includes('permission')) {
          bucketName = 'Articles'
          const { error: articlesError } = await supabase.storage
            .from('Articles')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            })
          uploadError = articlesError
        } else {
          uploadError = listingsError
        }
      }

      if (uploadError) {
        // Provide helpful error message
        if (uploadError.message?.includes('not found') || uploadError.message?.includes('Bucket')) {
          throw new Error('Storage bucket not found. Please ensure the "listings" bucket exists in Supabase Storage and has proper permissions.')
        } else if (uploadError.message?.includes('permission') || uploadError.message?.includes('policy')) {
          throw new Error('Permission denied. Please ensure your account has upload permissions for the storage bucket.')
        } else {
          throw new Error(`Upload failed: ${uploadError.message || 'Unknown error'}`)
        }
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath)

      setFormData(prev => ({ ...prev, avatar_url: publicUrl }))
      // Clear any previous errors on success
      setError('')
    } catch (err: any) {
      console.error('Error uploading avatar:', err)
      const errorMessage = err.message || 'Failed to upload avatar'
      
      // Don't block form submission - avatar is optional
      // Just show a warning that avatar won't be included
      if (errorMessage.includes('not found') || errorMessage.includes('Bucket')) {
        setError('Avatar upload failed: Storage bucket not configured. You can still submit the form without an avatar, or contact support to set up storage.')
      } else if (errorMessage.includes('permission') || errorMessage.includes('policy')) {
        setError('Avatar upload failed: Permission denied. You can still submit the form without an avatar.')
      } else {
        setError(`Avatar upload failed: ${errorMessage}. You can still submit the form without an avatar.`)
      }
      
      // Clear avatar URL so form can be submitted without it
      setFormData(prev => ({ ...prev, avatar_url: '' }))
      // Keep preview so user can see what they tried to upload
      // setAvatarPreview(null) // Commented out - keep preview
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleVerificationDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    // SECURITY: Validate file type (PDF, images, or common document formats)
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase()

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExt)) {
      setError('Please upload a PDF, image, or document file (PDF, JPG, PNG, DOC, DOCX)')
      return
    }

    // SECURITY: Validate file size (max 10MB for documents)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    // SECURITY: Validate minimum file size (prevent empty or corrupted files)
    if (file.size < 100) {
      setError('File appears to be corrupted or empty')
      return
    }

    setUploadingVerification(true)
    setError('')

    try {
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setVerificationDocumentPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setVerificationDocumentPreview(null)
      }

      // Upload to Supabase Storage
      const fileName = `${user?.id || 'temp'}-verification-${Date.now()}${fileExt}`
      const filePath = `verification-documents/${fileName}`

      // Try listings bucket first
      let bucketName = 'listings'
      let uploadError = null

      const { error: listingsError } = await supabase.storage
        .from('listings')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (listingsError) {
        // If bucket doesn't exist or has permission issues, try Articles bucket
        if (listingsError.message?.includes('not found') || listingsError.message?.includes('Bucket') || listingsError.message?.includes('permission')) {
          bucketName = 'Articles'
          const { error: articlesError } = await supabase.storage
            .from('Articles')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            })
          uploadError = articlesError
        } else {
          uploadError = listingsError
        }
      }

      if (uploadError) {
        if (uploadError.message?.includes('not found') || uploadError.message?.includes('Bucket')) {
          throw new Error('Storage bucket not found. Please ensure the "listings" bucket exists in Supabase Storage and has proper permissions.')
        } else if (uploadError.message?.includes('permission') || uploadError.message?.includes('policy')) {
          throw new Error('Permission denied. Please ensure your account has upload permissions for the storage bucket.')
        } else {
          throw new Error(`Upload failed: ${uploadError.message || 'Unknown error'}`)
        }
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath)

      setFormData(prev => ({ ...prev, verification_document_url: publicUrl }))
      setError('')
    } catch (err: any) {
      console.error('Error uploading verification document:', err)
      const errorMessage = err.message || 'Failed to upload verification document'
      
      if (errorMessage.includes('not found') || errorMessage.includes('Bucket')) {
        setError('Verification document upload failed: Storage bucket not configured. You can still submit the form without a document, or contact support to set up storage.')
      } else if (errorMessage.includes('permission') || errorMessage.includes('policy')) {
        setError('Verification document upload failed: Permission denied. You can still submit the form without a document.')
      } else {
        setError(`Verification document upload failed: ${errorMessage}. You can still submit the form without a document.`)
      }
      
      setFormData(prev => ({ ...prev, verification_document_url: '' }))
    } finally {
      setUploadingVerification(false)
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
      <SEO
        title="Get Listed - Join the Directory | Tasmanian Mental Health Directory"
        description="List your practice for free and connect with patients across Tasmania. Free directory listing for qualified mental health professionals. Grow your visibility and reach more clients."
        keywords="list practice free, mental health directory listing, join directory Tasmania, list your practice, mental health professionals directory"
        image="/images/hero-mountain.jpg"
        structuredData={structuredData}
      />
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
          <div className="hero-section relative text-center mb-12 py-12 sm:py-16 overflow-hidden rounded-2xl">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: (settings['get_listed_hero_background'] && settings['get_listed_hero_background'].trim())
                  ? `url(${settings['get_listed_hero_background'].trim()})`
                  : 'linear-gradient(to bottom right, #ecfdf5, #ffffff, #d1fae5)'
              }}
            ></div>
            {(settings['get_listed_hero_background'] && settings['get_listed_hero_background'].trim()) && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-sm"></div>
            )}
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                Join the Tasmanian Mental Health Directory
              </h1>
              <p className="text-xl text-gray-600 mb-2">
                <strong>List your practice for free</strong> and connect with patients across Tasmania. Free directory listing for qualified mental health professionals.
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
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-xl mb-8 flex items-start gap-3 shadow-lg">
              <AlertCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Featured Listings Callout */}
          <div className="bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="bg-yellow-500 rounded-full p-3">
                  <Star className="w-6 h-6 text-white fill-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Want More Visibility?</h3>
                  <p className="text-sm text-gray-700">Upgrade to Featured Listing for top placement, verified badge, and enhanced profile - just $29/month</p>
                </div>
              </div>
              <Link 
                to="/featured-listings" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors shadow-md hover:shadow-lg whitespace-nowrap"
              >
                <Star className="w-5 h-5" />
                View Featured Plans
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

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
                        placeholder="your.email@example.com"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                      />
                    </div>
                    {user?.email && (
                      <p className="mt-1 text-xs text-gray-500">
                        Pre-filled from your account. You can edit if needed.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-shrink-0">
                        <select
                          value={phoneCountryCode}
                          onChange={(e) => {
                            setPhoneCountryCode(e.target.value)
                            setPhoneError('')
                          }}
                          className="appearance-none pl-3 pr-8 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white text-sm font-medium"
                        >
                          {COUNTRY_CODES.map(({ code, flag }) => (
                            <option key={code} value={code}>
                              {flag} {code}
                            </option>
                          ))}
                        </select>
                        <Phone className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                      </div>
                      <div className="relative flex-1">
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          onBlur={() => {
                            if (formData.phone) {
                              const isValid = validatePhoneNumber(formData.phone, phoneCountryCode)
                              if (!isValid) {
                                setPhoneError('Please enter a valid phone number')
                              } else {
                                setPhoneError('')
                              }
                            }
                          }}
                          placeholder={phoneCountryCode === '+61' ? '(03) 6234 5678' : 'Enter phone number'}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all bg-white ${
                            phoneError ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary-500'
                          }`}
                        />
                      </div>
                    </div>
                    {phoneError && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {phoneError}
                      </p>
                    )}
                    {phoneCountryCode === '+61' && !phoneError && (
                      <p className="mt-1 text-xs text-gray-500">
                        Format: (03) 6234 5678 or 0362345678
                      </p>
                    )}
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
                      onChange={(e) => setFormData({ ...formData, profession: e.target.value, profession_other: e.target.value === 'Other' ? formData.profession_other : '' })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                    >
                      <option value="">Select profession...</option>
                      {PROFESSIONS.map(prof => (
                        <option key={prof} value={prof}>{prof}</option>
                      ))}
                    </select>
                    {formData.profession === 'Other' && (
                      <div className="mt-3">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Please specify your profession *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.profession_other}
                          onChange={(e) => setFormData({ ...formData, profession_other: e.target.value })}
                          placeholder="Enter your profession"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                        />
                      </div>
                    )}
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Accredited Member Number
                  </label>
                  <input
                    type="text"
                    value={formData.accredited_member_number}
                    onChange={(e) => setFormData({ ...formData, accredited_member_number: e.target.value })}
                    placeholder="e.g. Social work registration number, AASW membership number, etc."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    For self-regulating bodies (e.g., social work, counselling associations)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Verification Document
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleVerificationDocumentUpload}
                      disabled={uploadingVerification}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    />
                    {uploadingVerification && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
                      </div>
                    )}
                  </div>
                  {verificationDocumentPreview && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Document preview:</p>
                      <img 
                        src={verificationDocumentPreview} 
                        alt="Verification document preview" 
                        className="max-w-xs border-2 border-gray-200 rounded-lg"
                      />
                    </div>
                  )}
                  {formData.verification_document_url && !verificationDocumentPreview && (
                    <div className="mt-3">
                      <p className="text-sm text-green-600 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Document uploaded successfully
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a copy of your registration certificate, membership card, or other verification document (PDF, JPG, PNG, DOC, DOCX, max 10MB)
                  </p>
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
                  <span className="text-sm font-medium text-gray-700">I provide Statewide services via Telehealth only</span>
                </label>

                {!formData.is_statewide_telehealth && (
                  <>
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
                          required={!formData.is_statewide_telehealth}
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
                          required={!formData.is_statewide_telehealth}
                          value={formData.postcode}
                          onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                          placeholder="7000"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
                        />
                      </div>
                    </div>
                  </>
                )}

                {formData.is_statewide_telehealth && (
                  <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-4">
                    <p className="text-sm text-gray-700">
                      <strong>Note:</strong> Since you provide Statewide Telehealth services only, address fields are not required.
                    </p>
                  </div>
                )}

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

            <div className="space-y-4 pt-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-primary-200 transition-colors">
                  <input
                    type="checkbox"
                    id="agree-terms-listing"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2 cursor-pointer flex-shrink-0"
                  />
                  <label htmlFor="agree-terms-listing" className="text-sm text-gray-700 cursor-pointer flex-1">
                    I agree to the{' '}
                    <Link to="/terms-of-service" target="_blank" className="text-primary-600 hover:text-primary-700 underline font-semibold">
                      Terms and Conditions
                    </Link>
                  </label>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-primary-200 transition-colors">
                  <input
                    type="checkbox"
                    id="agree-privacy-listing"
                    checked={agreedToPrivacy}
                    onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2 cursor-pointer flex-shrink-0"
                  />
                  <label htmlFor="agree-privacy-listing" className="text-sm text-gray-700 cursor-pointer flex-1">
                    I agree to the{' '}
                    <Link to="/privacy-policy" target="_blank" className="text-primary-600 hover:text-primary-700 underline font-semibold">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center">
                By proceeding, you agree to our Terms and Conditions and Privacy Policy.
              </p>
              <div className="flex flex-col sm:flex-row justify-end items-center gap-4">
                <button
                  type="submit"
                  disabled={loading || !agreedToTerms || !agreedToPrivacy}
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
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
