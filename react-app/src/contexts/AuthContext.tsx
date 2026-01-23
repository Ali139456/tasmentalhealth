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
      // Add timeout to prevent hanging
      const queryPromise = supabase
        .from('users')
        .select('role, email')
        .eq('id', userId)
        .single()

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      )

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any

      if (error) {
        if (error.code === 'PGRST116') {
          return 'lister'
        }
        throw error
      }
      
      return data?.role as UserRole || 'lister'
    } catch (error: any) {
      return 'lister'
    }
  }

  const refreshUser = async () => {
    try {
      setLoading(true)
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
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setRole(null)
    } catch (error) {
      setUser(null)
      setSession(null)
      setRole(null)
    }
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
