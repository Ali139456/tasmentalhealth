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
      // Try to get from cache first (sessionStorage)
      const cachedRole = sessionStorage.getItem(`user_role_${userId}`)
      if (cachedRole && ['admin', 'lister', 'public'].includes(cachedRole)) {
        return cachedRole as UserRole
      }

      // Fast query with shorter timeout
      const queryPromise = supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .maybeSingle()

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 1000) // Reduced to 1 second
      )

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any

      if (error) {
        if (error.code === 'PGRST116') {
          const defaultRole = 'lister'
          sessionStorage.setItem(`user_role_${userId}`, defaultRole)
          return defaultRole
        }
        throw error
      }
      
      const userRole = (data?.role as UserRole) || 'lister'
      // Cache the role
      sessionStorage.setItem(`user_role_${userId}`, userRole)
      return userRole
    } catch (error: any) {
      // Return cached or default
      const cachedRole = sessionStorage.getItem(`user_role_${userId}`)
      return (cachedRole as UserRole) || 'lister'
    }
  }

  const refreshUser = async () => {
    try {
      // Don't set loading to true immediately - allow UI to render first
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) throw error

      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        // Set a default role immediately from cache if available
        const cachedRole = sessionStorage.getItem(`user_role_${session.user.id}`)
        if (cachedRole && ['admin', 'lister', 'public'].includes(cachedRole)) {
          setRole(cachedRole as UserRole)
        }
        
        // Then fetch fresh role in background
        fetchUserRole(session.user.id).then(userRole => {
          setRole(userRole)
        }).catch(() => {
          // Keep cached role if fetch fails
        })
      } else {
        setRole(null)
      }
    } catch (error) {
      // On error, try to use cached role
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const cachedRole = sessionStorage.getItem(`user_role_${session.user.id}`)
        if (cachedRole && ['admin', 'lister', 'public'].includes(cachedRole)) {
          setRole(cachedRole as UserRole)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial load - set loading to false quickly
    refreshUser().finally(() => {
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          // Use cached role immediately
          const cachedRole = sessionStorage.getItem(`user_role_${session.user.id}`)
          if (cachedRole && ['admin', 'lister', 'public'].includes(cachedRole)) {
            setRole(cachedRole as UserRole)
          }
          
          // Fetch fresh role in background
          fetchUserRole(session.user.id).then(userRole => {
            setRole(userRole)
          }).catch(() => {
            // Keep cached role if fetch fails
          })
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
      // Clear cached role
      if (user?.id) {
        sessionStorage.removeItem(`user_role_${user.id}`)
      }
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setRole(null)
    } catch (error) {
      // Clear cached role even on error
      if (user?.id) {
        sessionStorage.removeItem(`user_role_${user.id}`)
      }
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
