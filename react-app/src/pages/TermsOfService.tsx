import { FileText, Mail, CheckCircle2, AlertCircle, Shield, Lock, Eye, FileCheck, Sparkles, ArrowRight } from 'lucide-react'

export function TermsOfService() {
  const terms = [
    { 
      number: '1', 
      icon: CheckCircle2, 
      title: 'Acceptance of Terms', 
      color: 'from-green-500 to-emerald-600',
      content: 'By accessing or using the Tasmanian Mental Health Directory website, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.'
    },
    { 
      number: '2', 
      icon: FileText, 
      title: 'Use of the Directory', 
      color: 'from-blue-500 to-blue-600',
      content: 'The directory is intended for use by individuals seeking mental health services and by qualified mental health professionals. Information provided in the directory is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment.'
    },
    { 
      number: '3', 
      icon: Shield, 
      title: 'Professional Listings', 
      color: 'from-purple-500 to-purple-600',
      content: 'All listed professionals must be registered with the Australian Health Practitioner Regulation Agency (AHPRA) and/or have Medicare registration. We reserve the right to verify credentials and remove listings that do not meet our standards.'
    },
    { 
      number: '4', 
      icon: Lock, 
      title: 'User Responsibilities', 
      color: 'from-indigo-500 to-indigo-600',
      content: 'Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account. You agree to notify us immediately of any unauthorized use of your account.'
    },
    { 
      number: '5', 
      icon: Eye, 
      title: 'Content Accuracy', 
      color: 'from-pink-500 to-pink-600',
      content: 'While we strive to ensure the accuracy of information in the directory, we do not warrant or guarantee the completeness, accuracy, or reliability of any information. Users should verify information directly with listed professionals.'
    },
    { 
      number: '6', 
      icon: AlertCircle, 
      title: 'Limitation of Liability', 
      color: 'from-orange-500 to-orange-600',
      content: 'The Tasmanian Mental Health Directory, its operators, and affiliates shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use the directory or any information contained therein.'
    },
    { 
      number: '7', 
      icon: FileCheck, 
      title: 'Modifications to Terms', 
      color: 'from-orange-500 to-orange-600',
      content: 'We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to the website. Your continued use of the directory constitutes acceptance of any modifications.'
    },
    { 
      number: '8', 
      icon: AlertCircle, 
      title: 'Termination', 
      color: 'from-orange-500 to-orange-600',
      content: 'We reserve the right to terminate or suspend access to the directory at any time, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties.'
    },
    { 
      number: '9', 
      icon: Lock, 
      title: 'Information Sharing and Confidentiality', 
      color: 'from-teal-500 to-teal-600',
      content: 'We respect your privacy and confidentiality. Information provided to the directory will not be shared with third parties without your explicit consent, except in specific legal or safety situations as required by law (such as mandatory reporting obligations, court orders, or situations where there is an immediate risk to safety). All information is handled in accordance with the Australian Privacy Principles and relevant privacy legislation.'
    },
    { 
      number: '10', 
      icon: FileText, 
      title: 'Governing Law', 
      color: 'from-indigo-500 to-indigo-600',
      content: 'These Terms of Service shall be governed by and construed in accordance with the laws of Tasmania, Australia. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Tasmania.'
    },
    { 
      number: '11', 
      icon: Mail, 
      title: 'Contact Information', 
      color: 'from-cyan-500 to-cyan-600',
      content: 'If you have any questions about these Terms of Service, please contact us at info@tasmentalhealthdirectory.com.au'
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
              <FileText className="w-10 h-10 text-white" />
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-orange-300 animate-pulse" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Terms of Service
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 max-w-2xl mx-auto">
              Terms and conditions for using the Tasmanian Mental Health Directory.
            </p>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-12 md:py-16 -mt-8 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-gradient-to-br from-white via-primary-50/50 to-white rounded-3xl shadow-2xl p-8 md:p-12 border border-primary-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Terms and Conditions of Use</h2>
                <div className="w-20 h-1 bg-gradient-to-r from-primary-500 to-primary-400 rounded-full mt-2"></div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-primary-100">
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                By accessing and using the Tasmanian Mental Health Directory, you agree to be bound by these Terms of Service. Please read them carefully.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Terms Cards Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-6">
            {terms.map((term) => {
              const Icon = term.icon
              return (
                <div
                  key={term.number}
                  className="group bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100 hover:border-primary-200 hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${term.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-bold text-gray-400">#{term.number}</span>
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {term.title}
                        </h3>
                      </div>
                      <div className="h-1 w-16 bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed pl-20">
                    {term.content}
                  </p>
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
              <h3 className="text-3xl md:text-4xl font-bold mb-4">Questions About Our Terms?</h3>
              <p className="text-xl text-primary-100 mb-6">Contact our directory team for clarification or assistance.</p>
              <a
                href="mailto:info@tasmentalhealthdirectory.com.au"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-all transform hover:scale-105 shadow-xl"
              >
                <Mail className="w-5 h-5" />
                info@tasmentalhealthdirectory.com.au
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Last Updated */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-primary-100 text-center">
            <p className="text-gray-700 text-lg">
              <strong className="text-primary-600">Last Updated:</strong> January 2026
            </p>
            <p className="text-sm text-gray-500 mt-2">
              By using this directory, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
