import { useState, useRef } from 'react'
import { Phone, AlertTriangle, Heart, Shield, Users, Home, FileText, Download, Printer, Plus, X, Star, Globe, MapPin, Building2 } from 'lucide-react'
import { HELPLINES } from '../lib/constants'
import { jsPDF } from 'jspdf'
import { useContentSettings } from '../hooks/useContentSettings'
import { SEO } from '../components/SEO'

interface SafetyPlanItem {
  id: string
  text: string
}

export function CrisisSupport() {
  const { settings } = useContentSettings()
  const [activeTab, setActiveTab] = useState<'safety-plan' | 'find-help'>('safety-plan')
  
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://tasmentalhealthdirectory.com.au'
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Crisis Support & Safety Planning',
    description: '24/7 crisis support resources and safety planning tools for mental health emergencies in Tasmania',
    url: `${siteUrl}/crisis-support`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: HELPLINES.map((helpline, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Organization',
          name: helpline.name,
          telephone: helpline.tel,
          url: helpline.website,
          description: helpline.description
        }
      }))
    }
  }
  
  const [safetyPlan, setSafetyPlan] = useState<Record<string, SafetyPlanItem[]>>({
    warningSigns: [],
    copingStrategies: [],
    distractions: [],
    peopleHelp: [],
    professionals: [],
    environmentSafe: [],
    reasonsLiving: []
  })
  const [selectedState, setSelectedState] = useState('TAS') // Default to Tasmania
  const printRef = useRef<HTMLDivElement>(null)

  const addItem = (section: string) => {
    const newItem: SafetyPlanItem = { id: Date.now().toString(), text: '' }
    setSafetyPlan(prev => ({
      ...prev,
      [section]: [...prev[section], newItem]
    }))
  }

  const removeItem = (section: string, id: string) => {
    setSafetyPlan(prev => ({
      ...prev,
      [section]: prev[section].filter(item => item.id !== id)
    }))
  }

  const updateItem = (section: string, id: string, text: string) => {
    setSafetyPlan(prev => ({
      ...prev,
      [section]: prev[section].map(item => item.id === id ? { ...item, text } : item)
    }))
  }

  const handlePrint = () => {
    if (!printRef.current) return
    
    // Check if there's any content to print
    const hasContent = Object.values(safetyPlan).some(section => 
      section.some(item => item.text.trim())
    )
    
    if (!hasContent) {
      alert('Please add some items to your safety plan before printing.')
      return
    }
    
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Please allow pop-ups to print your safety plan.')
      return
    }

    const printContent = printRef.current.innerHTML
    const styles = Array.from(document.styleSheets)
      .map(sheet => {
        try {
          return Array.from(sheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n')
        } catch (e) {
          return ''
        }
      })
      .join('\n')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>My Safety Plan</title>
          <style>
            ${styles}
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            .print-section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .print-section h3 {
              color: #39B8A6;
              border-bottom: 2px solid #39B8A6;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .print-item {
              margin-bottom: 10px;
              padding-left: 20px;
            }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <h1 style="color: #39B8A6; text-align: center; margin-bottom: 30px;">My Safety Plan</h1>
          <p style="text-align: center; color: #666; margin-bottom: 40px;">
            Based on the Stanley-Brown Safety Planning Intervention
          </p>
          ${printContent}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  const handleDownloadPDF = () => {
    if (!printRef.current) return

    // Check if there's any content to download
    const hasContent = Object.values(safetyPlan).some(section => 
      section.some(item => item.text.trim())
    )
    
    if (!hasContent) {
      alert('Please add some items to your safety plan before downloading.')
      return
    }

    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20
    let yPosition = margin

    // Title
    pdf.setFontSize(20)
    pdf.setTextColor(57, 184, 166) // primary-500 color
    pdf.text('My Safety Plan', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 10

    pdf.setFontSize(12)
    pdf.setTextColor(100, 100, 100)
    pdf.text('Based on the Stanley-Brown Safety Planning Intervention', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15

    // Sections
    sections.forEach((section) => {
      if (yPosition > pageHeight - 40) {
        pdf.addPage()
        yPosition = margin
      }

      const items = safetyPlan[section.key].filter(item => item.text.trim())
      if (items.length === 0) return

      pdf.setFontSize(16)
      pdf.setTextColor(57, 184, 166)
      pdf.text(`${section.num}. ${section.title}`, margin, yPosition)
      yPosition += 8

      pdf.setFontSize(10)
      pdf.setTextColor(100, 100, 100)
      const descLines = pdf.splitTextToSize(section.desc, pageWidth - 2 * margin)
      pdf.text(descLines, margin, yPosition)
      yPosition += descLines.length * 5 + 5

      items.forEach((item, itemIndex) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage()
          yPosition = margin
        }
        pdf.setFontSize(11)
        pdf.setTextColor(0, 0, 0)
        const textLines = pdf.splitTextToSize(`${itemIndex + 1}. ${item.text}`, pageWidth - 2 * margin - 10)
        pdf.text(textLines, margin + 5, yPosition)
        yPosition += textLines.length * 5 + 3
      })

      yPosition += 10
    })

      // Footer
      const totalPages = pdf.internal.pages.length - 1
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        pdf.setFontSize(8)
        pdf.setTextColor(150, 150, 150)
        pdf.text(
          `Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        )
      }

      pdf.save('my-safety-plan.pdf')
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('There was an error generating the PDF. Please try again.')
    }
  }

  // State-specific crisis lines and hospitals data
  const stateData: Record<string, {
    crisisLines: Array<{
      name: string
      description: string
      phone?: string
      website?: string
      badge?: string
      badgeColor?: string
    }>
    safeHavens?: Array<{
      name: string
      description: string
      address: string
      website?: string
    }>
    hospitals: Array<{
      name: string
      location: string
      phone: string
      address: string
      service?: string
      website?: string
    }>
  }> = {
    TAS: {
      crisisLines: [
        {
          name: 'Access Mental Health',
          description: 'Tasmanian Govt Mental Health Services Helpline (24/7)',
          phone: '1800 332 388',
          website: 'https://www.health.tas.gov.au/health-topics/mental-health',
          badge: 'Statewide Service',
          badgeColor: 'primary'
        },
        {
          name: 'Rural Alive & Well (RAW)',
          description: 'For rural communities. Available 24/7. Oatlands, TAS (HQ)',
          phone: '1800 729 827',
          website: 'https://rawtas.com.au',
          badge: 'Rural Support',
          badgeColor: 'emerald'
        },
        {
          name: 'A Tasmanian Lifeline',
          description: 'A local listening ear for Tasmanians in distress (8am-8pm)',
          phone: '1800 98 44 34',
          website: 'https://www.lifeline.org.au',
          badge: 'Statewide Service',
          badgeColor: 'primary'
        }
      ],
      safeHavens: [
        {
          name: 'Safe Haven Hobart',
          description: 'A non-clinical safe space at the Peacock Centre (after hours)',
          address: 'Peacock Centre, 10 Elphinstone Rd, North Hobart TAS 7000',
          website: 'https://www.health.tas.gov.au'
        },
        {
          name: 'Safe Haven Launceston',
          description: 'A welcoming environment for distress support (after hours)',
          address: '24 High St, Launceston TAS 7250',
          website: 'https://www.health.tas.gov.au'
        },
        {
          name: 'Safe Haven Burnie',
          description: 'Drop-in support space for mental health distress (after hours)',
          address: '6 Strahan St, Burnie TAS 7320',
          website: 'https://www.health.tas.gov.au'
        }
      ],
      hospitals: [
        { name: 'Royal Hobart Hospital', location: 'Hobart', phone: '(03) 6166 8308', address: '48 Liverpool St, Hobart TAS 7000', service: '24/7 Emergency', website: 'https://www.health.tas.gov.au/hospitals/royal-hobart-hospital' },
        { name: 'Launceston General Hospital', location: 'Launceston', phone: '(03) 6777 6777', address: '274-280 Charles St, Launceston TAS 7250', service: '24/7 Emergency', website: 'https://www.health.tas.gov.au/hospitals/launceston-general-hospital' },
        { name: 'North West Regional Hospital', location: 'Burnie', phone: '(03) 6430 6000', address: '23 Brickport Rd, Burnie TAS 7320', service: '24/7 Emergency', website: 'https://www.health.tas.gov.au/hospitals/north-west-regional-hospital' },
        { name: 'Mersey Community Hospital', location: 'Latrobe', phone: '(03) 6478 5000', address: 'Torquay Rd, Latrobe TAS 7307', service: '24/7 Emergency', website: 'https://www.health.tas.gov.au/hospitals/mersey-community-hospital' }
      ]
    },
    VIC: {
      crisisLines: [
        {
          name: 'Psychiatric Triage (Nurse-On-Call)',
          description: 'Immediate expert health advice from a registered nurse',
          phone: '1300 60 60 24',
          website: 'https://www.health.vic.gov.au',
          badge: 'Statewide Service',
          badgeColor: 'primary'
        },
        {
          name: 'SuicideLine Victoria',
          description: 'Specialist telephone counselling and information',
          phone: '1300 651 251',
          website: 'https://www.suicideline.org.au',
          badge: 'Statewide Service',
          badgeColor: 'primary'
        }
      ],
      hospitals: [
        { name: 'Royal Melbourne Hospital', location: 'Parkville', phone: '(03) 9342 7000', address: '300 Grattan St, Parkville VIC 3050', service: '24/7 Emergency', website: 'https://www.thermh.org.au' },
        { name: 'The Alfred Hospital', location: 'Prahran', phone: '(03) 9076 2000', address: '55 Commercial Rd, Melbourne VIC 3004', service: '24/7 Emergency & Trauma', website: 'https://www.alfredhealth.org.au' },
        { name: 'Austin Hospital', location: 'Heidelberg', phone: '(03) 9496 5000', address: '145 Studley Rd, Heidelberg VIC 3084', service: '24/7 Emergency', website: 'https://www.austin.org.au' },
        { name: 'Monash Medical Centre', location: 'Clayton', phone: '(03) 9594 6666', address: '246 Clayton Rd, Clayton VIC 3168', service: '24/7 Emergency', website: 'https://www.monashhealth.org' }
      ]
    },
    NSW: {
      crisisLines: [
        {
          name: 'Mental Health Line',
          description: '24/7 professional help and advice and referrals to local mental health services',
          phone: '1800 011 511',
          website: 'https://www.health.nsw.gov.au',
          badge: 'Statewide Service',
          badgeColor: 'primary'
        }
      ],
      hospitals: [
        { name: 'Royal Prince Alfred Hospital', location: 'Camperdown', phone: '(02) 9515 6111', address: '50 Missenden Rd, Camperdown NSW 2050', service: '24/7 Emergency', website: 'https://www.slhd.nsw.gov.au/rpa' },
        { name: 'St Vincent\'s Hospital', location: 'Darlinghurst', phone: '(02) 8382 1111', address: '390 Victoria St, Darlinghurst NSW 2010', service: '24/7 Emergency', website: 'https://www.svhs.org.au' },
        { name: 'Westmead Hospital', location: 'Westmead', phone: '(02) 8890 5555', address: 'Cnr Hawkesbury Rd & Darcy Rd, Westmead NSW 2145', service: '24/7 Emergency', website: 'https://www.wslhd.health.nsw.gov.au/Westmead-Hospital' },
        { name: 'Prince of Wales Hospital', location: 'Randwick', phone: '(02) 9382 2222', address: '320-346 Barker St, Randwick NSW 2031', service: '24/7 Emergency', website: 'https://www.seslhd.health.nsw.gov.au/Prince-of-Wales-Hospital' }
      ]
    },
    QLD: {
      crisisLines: [
        {
          name: '13 HEALTH',
          description: '24/7 health advice and information',
          phone: '13 43 25 84',
          website: 'https://www.health.qld.gov.au',
          badge: 'Statewide Service',
          badgeColor: 'primary'
        },
        {
          name: 'Mental Health Access Line',
          description: '24/7 mental health crisis support',
          phone: '1300 642 255',
          website: 'https://www.health.qld.gov.au',
          badge: 'Statewide Service',
          badgeColor: 'primary'
        }
      ],
      hospitals: [
        { name: 'Royal Brisbane and Women\'s Hospital', location: 'Herston', phone: '(07) 3646 8111', address: 'Butterfield St, Herston QLD 4029', service: '24/7 Emergency', website: 'https://www.health.qld.gov.au/rbwh' },
        { name: 'Princess Alexandra Hospital', location: 'Woolloongabba', phone: '(07) 3176 2111', address: '199 Ipswich Rd, Woolloongabba QLD 4102', service: '24/7 Emergency', website: 'https://www.health.qld.gov.au/metrosouth/pa-hospital' },
        { name: 'Gold Coast University Hospital', location: 'Southport', phone: '(07) 5687 0000', address: '1 Hospital Blvd, Southport QLD 4215', service: '24/7 Emergency', website: 'https://www.goldcoast.health.qld.gov.au' },
        { name: 'Townsville University Hospital', location: 'Townsville', phone: '(07) 4433 1111', address: '100 Angus Smith Dr, Douglas QLD 4814', service: '24/7 Emergency', website: 'https://www.townsville.health.qld.gov.au' }
      ]
    },
    WA: {
      crisisLines: [
        {
          name: 'Mental Health Emergency Response Line',
          description: '24/7 mental health crisis support',
          phone: '1300 555 788',
          website: 'https://www.health.wa.gov.au',
          badge: 'Statewide Service',
          badgeColor: 'primary'
        }
      ],
      hospitals: [
        { name: 'Royal Perth Hospital', location: 'Perth', phone: '(08) 9224 2244', address: '197 Wellington St, Perth WA 6000', service: '24/7 Emergency', website: 'https://www.rph.wa.gov.au' },
        { name: 'Sir Charles Gairdner Hospital', location: 'Nedlands', phone: '(08) 6457 3333', address: 'Hospital Ave, Nedlands WA 6009', service: '24/7 Emergency', website: 'https://www.scgh.health.wa.gov.au' },
        { name: 'Fiona Stanley Hospital', location: 'Murdoch', phone: '(08) 6152 2222', address: '11 Robin Warren Dr, Murdoch WA 6150', service: '24/7 Emergency', website: 'https://www.fsh.health.wa.gov.au' }
      ]
    },
    SA: {
      crisisLines: [
        {
          name: 'Mental Health Triage Service',
          description: '24/7 mental health crisis support and assessment',
          phone: '13 14 65',
          website: 'https://www.sahealth.sa.gov.au',
          badge: 'Statewide Service',
          badgeColor: 'primary'
        }
      ],
      hospitals: [
        { name: 'Royal Adelaide Hospital', location: 'Adelaide', phone: '(08) 7074 0000', address: 'Port Rd, Adelaide SA 5000', service: '24/7 Emergency', website: 'https://www.sahealth.sa.gov.au/wps/wcm/connect/public+content/sa+health+internet/services/hospitals+and+health+services/metropolitan+hospitals/royal+adelaide+hospital' },
        { name: 'Flinders Medical Centre', location: 'Bedford Park', phone: '(08) 8204 5511', address: 'Flinders Dr, Bedford Park SA 5042', service: '24/7 Emergency', website: 'https://www.sahealth.sa.gov.au/wps/wcm/connect/public+content/sa+health+internet/services/hospitals+and+health+services/metropolitan+hospitals/flinders+medical+centre' },
        { name: 'Lyell McEwin Hospital', location: 'Elizabeth Vale', phone: '(08) 8182 9000', address: 'Haydown Rd, Elizabeth Vale SA 5112', service: '24/7 Emergency', website: 'https://www.sahealth.sa.gov.au/wps/wcm/connect/public+content/sa+health+internet/services/hospitals+and+health+services/metropolitan+hospitals/lyell+mcewin+hospital' }
      ]
    },
    ACT: {
      crisisLines: [
        {
          name: 'Mental Health Triage',
          description: '24/7 mental health crisis support',
          phone: '1800 629 354',
          website: 'https://www.health.act.gov.au',
          badge: 'Territory-wide Service',
          badgeColor: 'primary'
        }
      ],
      hospitals: [
        { name: 'Canberra Hospital', location: 'Garran', phone: '(02) 5124 0000', address: 'Yamba Dr, Garran ACT 2605', service: '24/7 Emergency', website: 'https://www.canberrahospital.act.gov.au' },
        { name: 'Calvary Public Hospital', location: 'Bruce', phone: '(02) 6201 6111', address: 'Mary Potter Circuit, Bruce ACT 2617', service: '24/7 Emergency', website: 'https://www.calvarypublic.org.au' }
      ]
    },
    NT: {
      crisisLines: [
        {
          name: 'Mental Health Central Access',
          description: '24/7 mental health crisis support',
          phone: '1800 682 288',
          website: 'https://www.health.nt.gov.au',
          badge: 'Territory-wide Service',
          badgeColor: 'primary'
        }
      ],
      hospitals: [
        { name: 'Royal Darwin Hospital', location: 'Tiwi', phone: '(08) 8920 6011', address: 'Rocklands Dr, Tiwi NT 0810', service: '24/7 Emergency', website: 'https://www.health.nt.gov.au/hospitals/royal-darwin-hospital' },
        { name: 'Alice Springs Hospital', location: 'Alice Springs', phone: '(08) 8951 7777', address: 'Gap Rd, Alice Springs NT 0870', service: '24/7 Emergency', website: 'https://www.health.nt.gov.au/hospitals/alice-springs-hospital' }
      ]
    }
  }

  const sections = [
    { 
      key: 'warningSigns', 
      num: 1, 
      title: 'Warning Signs', 
      desc: 'What thoughts, images, moods, situations, or behaviours indicate to you that a crisis may be developing?',
      icon: AlertTriangle,
      suggestions: [
        "Feeling incredibly tired but can't sleep",
        "Thinking 'I am a burden'",
        "Isolating myself from friends",
        "Feeling agitated or easily angry",
        "Drinking more alcohol than usual",
        "Feeling trapped or hopeless"
      ]
    },
    { 
      key: 'copingStrategies', 
      num: 2, 
      title: 'Internal Coping Strategies', 
      desc: 'Things I can do to take my mind off my problems without contacting anyone else.',
      icon: Heart,
      suggestions: [
        "Practice 4-7-8 breathing",
        "Go for a walk in nature",
        "Listen to my 'Comfort' playlist",
        "Have a hot shower or bath",
        "Play with my pet",
        "Watch a favourite comedy show"
      ]
    },
    { 
      key: 'distractions', 
      num: 3, 
      title: 'People & Places for Distraction', 
      desc: 'People and social settings that provide distraction.',
      icon: Users,
      suggestions: [
        "Go to the local library",
        "Visit a coffee shop",
        "Walk around the park",
        "Call a friend just to chat",
        "Go to the gym",
        "Visit a museum or gallery"
      ]
    },
    { 
      key: 'peopleHelp', 
      num: 4, 
      title: 'People I Can Ask for Help', 
      desc: 'Family or friends I can contact during a crisis.',
      icon: Users,
      suggestions: []
    },
    { 
      key: 'professionals', 
      num: 5, 
      title: 'Professionals I Can Contact', 
      desc: 'Clinicians, local emergency services, and helplines.',
      icon: Phone,
      suggestions: []
    },
    { 
      key: 'environmentSafe', 
      num: 6, 
      title: 'Making the Environment Safe', 
      desc: 'Steps to make my environment safer (e.g. removing access to means).',
      icon: Shield,
      suggestions: [
        "Remove alcohol from the house",
        "Give medication to someone else to hold",
        "Stay in public areas",
        "Avoid being alone in my room",
        "Lock away sharp objects"
      ]
    },
    { 
      key: 'reasonsLiving', 
      num: 7, 
      title: 'Reasons for Living', 
      desc: 'The things that are important to me and worth living for.',
      icon: Star,
      suggestions: [
        "My children/family",
        "My pets",
        "Hope that things can get better",
        "Specific future goals (travel, career)",
        "Not wanting to hurt others",
        "Religious or spiritual beliefs"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-50">
      <SEO
        title="Crisis Support & Safety Planning | Tasmanian Mental Health Directory"
        description="24/7 crisis support resources and safety planning tools for mental health emergencies in Tasmania. Build your personalised safety plan with coping strategies and support contacts."
        keywords="crisis support Tasmania, mental health emergency, suicide prevention, safety plan, 24/7 helpline, mental health crisis"
        image="/images/hero-mountain.jpg"
        structuredData={structuredData}
      />
      {/* Hero Section - Enhanced */}
      <section className="hero-section relative text-white py-16 sm:py-20 md:py-24 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: (settings['crisis_hero_background'] && settings['crisis_hero_background'].trim())
              ? `url(${settings['crisis_hero_background'].trim()})`
              : 'linear-gradient(to bottom right, #39B8A6, #2E9385, #1e6b5e)'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-teal-950/80 to-teal-800/40"></div>
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6 border border-white/30">
              <Shield className="w-5 h-5" />
              <span className="text-sm sm:text-base font-semibold">Your Personal Safety Resource</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 px-2 leading-tight">
              Create Your Personal Safety Plan
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/95 mb-3 px-2 font-medium">
              A proven tool to help you navigate through difficult moments
            </p>
            <p className="text-base sm:text-lg md:text-xl text-white/85 mb-6 sm:mb-8 px-2 max-w-2xl mx-auto">
              Based on the evidence based Stanley Brown Safety Planning Intervention. Build your personalised plan with coping strategies, support contacts, and resources, all in one secure place.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => {
                  setActiveTab('safety-plan')
                  document.getElementById('safety-plan-content')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="px-8 py-4 bg-white text-primary-600 rounded-xl font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl text-base sm:text-lg flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Start Building Your Plan
              </button>
              <a
                href="#find-help"
                onClick={() => setActiveTab('find-help')}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-bold hover:bg-white/20 hover:border-white/40 transition-all transform hover:scale-105 shadow-xl text-base sm:text-lg flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Find Immediate Help
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Tabs - Enhanced Design */}
        <div className="flex border-b-2 border-gray-200 mb-6 sm:mb-8 max-w-4xl mx-auto">
          <button
            onClick={() => setActiveTab('safety-plan')}
            className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 font-semibold text-sm sm:text-base md:text-lg transition-all ${
              activeTab === 'safety-plan'
                ? 'border-b-4 border-primary-500 text-primary-600 bg-primary-50/50'
                : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">My Digital Safety Plan</span>
              <span className="sm:hidden">Safety Plan</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('find-help')}
            className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 font-semibold text-sm sm:text-base md:text-lg transition-all ${
              activeTab === 'find-help'
                ? 'border-b-4 border-primary-500 text-primary-600 bg-primary-50/50'
                : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Find Help Now</span>
              <span className="sm:hidden">Find Help</span>
            </div>
          </button>
        </div>

        {/* Safety Plan Tab - Enhanced */}
        {activeTab === 'safety-plan' && (
          <div id="safety-plan-content" className="max-w-4xl mx-auto">
            {/* Info Banner */}
            <div className="bg-gradient-to-r from-primary-50 to-emerald-50 rounded-2xl p-6 mb-8 border-2 border-primary-200 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="bg-primary-500 rounded-full p-3 flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Why Create a Safety Plan?</h3>
                  <p className="text-gray-700 leading-relaxed">
                    A safety plan is a personalised, written list of coping strategies and sources of support that you can use when you're experiencing thoughts of suicide or a mental health crisis. Research shows that having a safety plan can significantly reduce suicidal thoughts and behaviours. This tool helps you identify warning signs, develop coping strategies, and know who to contact for help.
                  </p>
                </div>
              </div>
            </div>

            {/* Hidden print/PDF content */}
            <div ref={printRef} className="hidden">
              {sections.map(section => {
                const items = safetyPlan[section.key].filter(item => item.text.trim())
                if (items.length === 0) return null
                return (
                  <div key={section.key} className="print-section">
                    <h3>{section.num}. {section.title}</h3>
                    <p style={{ color: '#666', marginBottom: '15px' }}>{section.desc}</p>
                    {items.map((item, index) => (
                      <div key={item.id} className="print-item">
                        {index + 1}. {item.text}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 lg:p-12 mb-6 sm:mb-8">
              <div className="mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 text-gray-900">My Safety Plan</h2>
                  <p className="text-sm sm:text-base md:text-lg text-gray-600">
                    Based on the Stanley-Brown Safety Planning Intervention. This plan belongs to you. It's designed to help you navigate through a crisis until it passes.
                  </p>
              </div>

              <div className="space-y-6 sm:space-y-8">
                {sections.map(section => {
                  return (
                    <div key={section.key} className="bg-gradient-to-r from-primary-50 to-white rounded-xl p-4 sm:p-6 border-l-4 border-primary-500 shadow-sm">
                      <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg sm:text-xl">{section.num}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{section.title}</h3>
                          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{section.desc}</p>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                        {safetyPlan[section.key].map((item, index) => (
                          <div key={item.id} className="flex items-center gap-2 sm:gap-3 bg-white rounded-lg p-2 sm:p-3 border border-gray-200">
                            <span className="text-primary-600 font-semibold w-5 sm:w-6 text-sm sm:text-base">{index + 1}.</span>
                            <input
                              type="text"
                              value={item.text}
                              onChange={(e) => updateItem(section.key, item.id, e.target.value)}
                              placeholder={`Enter ${section.title.toLowerCase()}...`}
                              className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 border-0 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded text-sm sm:text-base"
                            />
                            <button
                              onClick={() => removeItem(section.key, item.id)}
                              className="p-1.5 sm:p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                            >
                              <X className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add Button */}
                      <button
                        onClick={() => addItem(section.key)}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors font-semibold flex items-center justify-center gap-2 mb-3 sm:mb-4 text-sm sm:text-base"
                      >
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                        Add {section.title.toLowerCase()}
                      </button>

                      {/* Suggestions */}
                      {section.suggestions.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                          <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Suggestions:</p>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {section.suggestions.map((suggestion, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  const newItem: SafetyPlanItem = { id: Date.now().toString() + idx, text: suggestion }
                                  setSafetyPlan(prev => ({
                                    ...prev,
                                    [section.key]: [...prev[section.key], newItem]
                                  }))
                                }}
                                className="px-2 sm:px-3 py-1 sm:py-1.5 bg-white border border-primary-200 text-primary-700 rounded-full text-xs sm:text-sm hover:bg-primary-50 hover:border-primary-300 transition-colors"
                              >
                                + {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button
                  onClick={handlePrint}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm sm:text-base transform hover:scale-105"
                >
                  <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
                  Print Plan
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm sm:text-base transform hover:scale-105"
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Find Help Tab - Enhanced */}
        {activeTab === 'find-help' && (
          <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10">
            {/* Emergency Banner - Compact */}
            <div className="relative bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white rounded-xl p-5 sm:p-6 text-center shadow-xl overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full blur-2xl"></div>
              </div>
              
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">In an Emergency?</h3>
                <p className="text-sm sm:text-base mb-4 text-white/95 max-w-xl mx-auto">
                  If you or someone else is in immediate danger, do not wait.
                </p>
                <a
                  href="tel:000"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-red-600 rounded-lg font-bold text-base hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg"
                >
                  <Phone className="w-5 h-5" />
                  Call 000 Now
                </a>
              </div>
            </div>

            {/* Helplines Section - Compact */}
            <div className="bg-gradient-to-br from-white via-primary-50/30 to-white rounded-xl p-5 sm:p-6 shadow-lg border border-primary-100">
              <div className="mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">National 24/7 Support Lines</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Free, confidential support available around the clock</p>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {HELPLINES.map(helpline => (
                  <div key={helpline.name} className="p-4">
                      <h4 className="text-base sm:text-lg font-bold mb-1.5 text-gray-900">{helpline.name}</h4>
                      <p className="text-xl sm:text-2xl font-bold text-primary-600 mb-2">{helpline.number}</p>
                      <p className="text-gray-600 text-xs sm:text-sm mb-3 leading-relaxed">{helpline.description}</p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <a
                          href={`tel:${helpline.tel}`}
                          className="flex-1 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Call
                        </a>
                        <a
                          href={helpline.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 sm:flex-none px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          Website
                        </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* State & Territory Resources Section */}
            <div className="bg-gradient-to-br from-gray-50 via-white to-primary-50/20 rounded-2xl p-6 sm:p-8 md:p-10 shadow-xl border border-gray-200">
              <div className="mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">State & Territory Resources</h3>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">Select your state to see local crisis lines and hospital emergency departments</p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { code: 'TAS', name: 'Tasmania' },
                  { code: 'VIC', name: 'Victoria' },
                  { code: 'NSW', name: 'New South Wales' },
                  { code: 'QLD', name: 'Queensland' },
                  { code: 'WA', name: 'Western Australia' },
                  { code: 'SA', name: 'South Australia' },
                  { code: 'ACT', name: 'Australian Capital Territory' },
                  { code: 'NT', name: 'Northern Territory' }
                ].map(state => (
                  <button
                    key={state.code}
                    onClick={() => setSelectedState(state.code)}
                    className={`group relative p-4 sm:p-5 rounded-xl border-2 transition-all transform hover:scale-105 ${
                      selectedState === state.code
                        ? 'bg-primary-500 text-white border-primary-600 shadow-lg'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:bg-primary-50 shadow-md hover:shadow-lg'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`text-2xl sm:text-3xl font-bold mb-1 ${selectedState === state.code ? 'text-white' : 'text-primary-600'}`}>
                        {state.code}
                      </div>
                      <div className={`text-xs sm:text-sm font-semibold ${selectedState === state.code ? 'text-white/90' : 'text-gray-700'}`}>
                        {state.name}
                      </div>
                    </div>
                    {selectedState === state.code && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Star className="w-4 h-4 text-primary-500 fill-primary-500" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* State-specific content */}
              {stateData[selectedState] && (
                <>
              {/* Mental Health Crisis Lines */}
              {stateData[selectedState].crisisLines.length > 0 && (
                <div className="mt-8 sm:mt-10 bg-white rounded-xl p-6 sm:p-8 border-2 border-primary-200 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <Phone className="w-6 h-6 text-primary-600" />
                    <h4 className="text-lg sm:text-xl font-bold text-gray-900">Mental Health Crisis Lines & Services</h4>
                  </div>
                  <div className="space-y-4 sm:space-y-6">
                    {stateData[selectedState].crisisLines.map((service, idx) => {
                      const badgeColorClass = service.badgeColor === 'emerald' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-primary-100 text-primary-700'
                      const buttonColorClass = service.badgeColor === 'emerald'
                        ? 'bg-emerald-500 hover:bg-emerald-600'
                        : 'bg-primary-500 hover:bg-primary-600'
                      const cardColorClass = service.badgeColor === 'emerald'
                        ? 'from-emerald-50 to-white border-emerald-200 hover:border-emerald-300'
                        : 'from-primary-50 to-white border-primary-200 hover:border-primary-300'
                      
                      return (
                        <div key={idx} className={`bg-gradient-to-br ${cardColorClass} rounded-xl p-5 sm:p-6 border transition-all shadow-md`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h5 className="font-bold text-gray-900 mb-2 text-lg sm:text-xl">{service.name}</h5>
                              <p className="text-sm sm:text-base text-gray-700 mb-3">
                                {service.description}
                              </p>
                              {service.badge && (
                                <div className="flex items-center gap-2 mb-3">
                                  <span className={`px-3 py-1 ${badgeColorClass} rounded-full text-xs font-semibold`}>
                                    {service.badge}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3">
                            {service.phone && (
                              <a
                                href={`tel:${service.phone.replace(/\s/g, '')}`}
                                className={`flex-1 px-5 py-3 ${buttonColorClass} text-white rounded-lg transition-all text-base font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105`}
                              >
                                <Phone className="w-5 h-5" />
                                {service.phone}
                              </a>
                            )}
                            {service.website && (
                              <a
                                href={service.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 sm:flex-none px-5 py-3 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                              >
                                <Globe className="w-4 h-4" />
                                Website
                              </a>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Safe Havens (TAS only) */}
              {stateData[selectedState].safeHavens && stateData[selectedState].safeHavens!.length > 0 && (
                <div className="mt-8 sm:mt-10 bg-white rounded-xl p-6 sm:p-8 border-2 border-primary-200 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <Home className="w-6 h-6 text-primary-600" />
                    <h4 className="text-lg sm:text-xl font-bold text-gray-900">Safe Haven Locations</h4>
                  </div>
                  <div className="space-y-4 sm:space-y-6">
                    {stateData[selectedState].safeHavens!.map((haven, idx) => (
                      <div key={idx} className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-5 sm:p-6 border border-primary-200 hover:border-primary-300 transition-all shadow-md">
                        <h5 className="font-bold text-gray-900 mb-2 text-lg sm:text-xl">{haven.name}</h5>
                        <p className="text-sm sm:text-base text-gray-700 mb-3">
                          {haven.description}
                        </p>
                        <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary-500" />
                          {haven.address}
                        </p>
                        {haven.website && (
                          <a
                            href={haven.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all text-sm font-semibold shadow-md hover:shadow-lg"
                          >
                            <Globe className="w-4 h-4" />
                            Website
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hospital Emergency Departments */}
              {stateData[selectedState].hospitals.length > 0 && (
                <div className="mt-8 sm:mt-10 bg-white rounded-xl p-6 sm:p-8 border-2 border-primary-200 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <Building2 className="w-6 h-6 text-primary-600" />
                    <h4 className="text-lg sm:text-xl font-bold text-gray-900">
                      {selectedState === 'TAS' ? 'Tasmania' :
                       selectedState === 'VIC' ? 'Victoria' :
                       selectedState === 'NSW' ? 'New South Wales' :
                       selectedState === 'QLD' ? 'Queensland' :
                       selectedState === 'WA' ? 'Western Australia' :
                       selectedState === 'SA' ? 'South Australia' :
                       selectedState === 'ACT' ? 'ACT' :
                       selectedState === 'NT' ? 'Northern Territory' : ''} Hospital Emergency Departments
                    </h4>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {stateData[selectedState].hospitals.map((hospital, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-4 sm:p-5 border border-gray-200 hover:border-primary-300 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-bold text-gray-900 text-base sm:text-lg flex-1">{hospital.name}</h5>
                          <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-semibold ml-2">
                            {hospital.location}
                          </span>
                        </div>
                        {hospital.service && (
                          <p className="text-xs text-gray-600 mb-3">{hospital.service}</p>
                        )}
                        <p className="text-xs text-gray-500 mb-3">{hospital.address}</p>
                        <div className="flex gap-2">
                          <a
                            href={`tel:${hospital.phone.replace(/\s/g, '')}`}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-semibold shadow-md"
                          >
                            <Phone className="w-3 h-3" />
                            Call
                          </a>
                          <a
                            href={hospital.website || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs font-semibold"
                          >
                            <Globe className="w-3 h-3" />
                            Info
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              </>
              )}

              {/* No data available fallback */}
              {!stateData[selectedState] && (
                <div className="mt-8 sm:mt-10 bg-white rounded-xl p-8 sm:p-12 border-2 border-gray-200 shadow-lg text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MapPin className="w-8 h-8 text-primary-600" />
                  </div>
                  <h4 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Resources Coming Soon</h4>
                  <p className="text-gray-600 text-lg mb-6 max-w-2xl mx-auto">
                    We're working on adding comprehensive crisis lines and hospital information for this state. 
                    In the meantime, please refer to the <strong>National 24/7 Support Lines</strong> above for immediate help.
                  </p>
                  <div className="bg-primary-50 rounded-xl p-6 border border-primary-200">
                    <p className="text-sm text-gray-700 mb-4">
                      <strong>For immediate crisis support:</strong>
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <a
                        href="tel:131114"
                        className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all font-semibold shadow-md"
                      >
                        <Phone className="w-4 h-4 inline mr-2" />
                        Lifeline: 13 11 14
                      </a>
                      <a
                        href="tel:000"
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold shadow-md"
                      >
                        Emergency: 000
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
