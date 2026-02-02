import { useState } from 'react'
import { Shield, Mail, Lock, Eye, FileCheck, Users, Database, AlertTriangle, CheckCircle2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'

export function PrivacyPolicy() {
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())

  const toggleCard = (index: number) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedCards(newExpanded)
  }

  const terms = [
    { 
      icon: FileCheck, 
      title: 'Purpose and Usage', 
      color: 'from-blue-500 to-blue-600',
      content: 'Information on the Tasmanian Health Directory (the directory) can only be used for direct patient care. This is deemed as the purpose. It cannot be used for general mail outs or notifications. Subscribers to the directory will be restricted to Tasmanian-based health professionals with Australian Health Practitioner Regulation Agency (AHPRA) and/or Medicare registration.'
    },
    { 
      icon: Database, 
      title: 'Data Sharing and Confidentiality', 
      color: 'from-purple-500 to-purple-600',
      content: 'We respect your privacy and confidentiality. Information provided to the directory will not be shared with third parties without your explicit consent, except in specific legal or safety situations as required by law (such as mandatory reporting obligations, court orders, or situations where there is an immediate risk to safety). All information is handled in accordance with the Australian Privacy Principles and relevant privacy legislation.'
    },
    { 
      icon: Users, 
      title: 'Third-Party Requests', 
      color: 'from-emerald-500 to-emerald-600',
      content: 'From time to time the Directory receives requests from varied health organisations, e.g. specialists, health service providers, to obtain addressing information in relation to the health providers in Tasmania e.g. names, organisation addressing information. We have strict policies and procedures around the release of this information; it must only be used for the delivery of relevant clinical or professional information.'
    },
    { 
      icon: AlertTriangle, 
      title: 'Right to Withdraw Access', 
      color: 'from-orange-500 to-orange-600',
      content: 'We reserve the right to withdraw a subscriber\'s access for breach of conditions, policy or procedure. This action must be taken by written notification to the subscriber.'
    },
    { 
      icon: Shield, 
      title: 'No Warranty', 
      color: 'from-red-500 to-red-600',
      content: 'The Directory does not warrant, guarantee or make any representation regarding the use, or the results of the use, of the directory in terms of correctness, accuracy, reliability, functionality or otherwise.'
    },
    { 
      icon: Lock, 
      title: 'Limitation of Liability', 
      color: 'from-indigo-500 to-indigo-600',
      content: 'The Directory or its employees will not be responsible for any loss, damage, cost or expense suffered or incurred by the subscriber as a result of or arising from the subscriber\'s failure to access the directory or the quality of the data contained within.'
    },
    { 
      icon: Eye, 
      title: 'Monitoring', 
      color: 'from-pink-500 to-pink-600',
      content: 'We have a method to track inappropriate use as per the purpose.'
    },
    { 
      icon: AlertTriangle, 
      title: 'Reporting Misuse', 
      color: 'from-yellow-500 to-yellow-600',
      content: 'The subscriber must advise the directory administrators immediately if there is reason to suspect that the directory is being used contrary to the purpose.'
    },
    { 
      icon: Mail, 
      title: 'Service Updates', 
      color: 'from-cyan-500 to-cyan-600',
      content: 'We will add an organisation\'s email address to a mailing list in order to keep subscribers informed of updates to the service.'
    },
    { 
      icon: Users, 
      title: 'Public Directory Listing', 
      color: 'from-teal-500 to-teal-600',
      content: 'Subscribers to the directory also automatically release basic practice contact information for the public online version of the directory. An organisation can withdraw their consent to be listed publicly at any time by contacting us.'
    },
    { 
      icon: CheckCircle2, 
      title: 'Data Quality', 
      color: 'from-green-500 to-green-600',
      content: 'The organisation agrees to advise the directory of any data quality issues by contacting our support team.'
    },
    { 
      icon: FileCheck, 
      title: 'Intellectual Property', 
      color: 'from-violet-500 to-violet-600',
      content: 'The data and intellectual property of the directory and all printed versions at all times remain the property of the Directory.'
    },
    { 
      icon: Lock, 
      title: 'Licensing Restrictions', 
      color: 'from-rose-500 to-rose-600',
      content: 'The subscriber must not sub-license, assign, share, sell, rent, lease or otherwise transfer its right to use or access the directory.'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
      {/* Enhanced Hero Section */}
      <section className="hero-section relative bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white py-16 md:py-24 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6 shadow-2xl">
              <Shield className="w-10 h-10 text-white" />
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-300 animate-pulse" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Privacy Policy & Terms
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 max-w-2xl mx-auto">
              Guidelines on how we handle your data and the terms of use for the Tasmanian Health Directory.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Statement Card */}
      <section className="py-12 md:py-16 -mt-8 relative z-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-gradient-to-br from-white via-primary-50/50 to-white rounded-3xl shadow-2xl p-8 md:p-12 border border-primary-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Privacy Statement</h2>
                <div className="w-20 h-1 bg-gradient-to-r from-primary-500 to-primary-400 rounded-full mt-2"></div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-primary-100">
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                The Tasmanian Mental Health Directory handles all personal and sensitive information collected, used and disclosed in connection with our practitioner information form in compliance with the <strong className="text-primary-600">Australian Privacy Principles (March 2014)</strong> Schedule 1 of the Privacy Act 1998.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Expandable Terms Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Terms and Conditions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Click on any term to view detailed information
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {terms.map((term, index) => {
              const Icon = term.icon
              const isExpanded = expandedCards.has(index)
              
              return (
                <div
                  key={index}
                  className={`bg-white rounded-2xl shadow-lg transition-all border ${
                    isExpanded 
                      ? 'border-primary-300 shadow-2xl' 
                      : 'border-gray-100 hover:border-primary-200 hover:shadow-xl'
                  } overflow-hidden self-start`}
                >
                  {/* Card Header - Always Visible */}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      toggleCard(index)
                    }}
                    className="w-full p-6 text-left group hover:bg-primary-50/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-14 h-14 bg-gradient-to-br ${term.color} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                            {term.title}
                          </h3>
                          {!isExpanded && (
                            <div className="h-1 w-12 bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <div className={`flex-shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                      </div>
                    </div>
                  </button>

                  {/* Expandable Content */}
                  {isExpanded && (
                  <div
                    className="transition-all duration-300 ease-in-out overflow-hidden"
                  >
                    <div className="px-6 pb-6">
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-gray-700 leading-relaxed">
                          {term.content}
                        </p>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            toggleCard(index)
                          }}
                          className="mt-4 text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center gap-1 transition-colors"
                        >
                          Show Less
                          <ChevronUp className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-3xl shadow-2xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            </div>
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-4">Have questions about our policies?</h3>
              <p className="text-xl text-primary-100 mb-6">Contact our directory team for clarification or assistance.</p>
              <a
                href="mailto:info@tasmentalhealthdirectory.com.au"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-all transform hover:scale-105 shadow-xl"
              >
                <Mail className="w-5 h-5" />
                info@tasmentalhealthdirectory.com.au
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
