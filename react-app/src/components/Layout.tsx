import { type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const isAdminPage = location.pathname === '/admin'
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      {!isAdminPage && <Footer />}
    </div>
  )
}
