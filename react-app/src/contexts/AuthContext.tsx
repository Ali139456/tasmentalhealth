import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { UserRole } from '../types'

type Session = Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']

interface AuthContextType {
  user: User | null
  session: Session
  role: UserRole | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data?.role as UserRole || 'public'
    } catch (error) {
      console.error('Error fetching user role:', error)
      return 'public'
    }
  }

  const refreshUser = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error

      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        const userRole = await fetchUserRole(session.user.id)
        setRole(userRole)
      } else {
        setRole(null)
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          const userRole = await fetchUserRole(session.user.id)
          setRole(userRole)
        } else {
          setRole(null)
        }

        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setRole(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
