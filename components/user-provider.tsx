'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type UserContextType = {
  user: User | null
  profile: Profile | null
  plan: Plan | null
  loading: boolean
  refreshUser: () => Promise<void>
}

type Profile = {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

type Plan = {
  id: string
  user_id: string
  plan_type: 'free' | 'pro' | 'enterprise'
  features: Record<string, any>
  created_at: string
  updated_at: string
}

const UserContext = createContext<UserContextType>({
  user: null,
  profile: null,
  plan: null,
  loading: true,
  refreshUser: async () => {},
})

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const supabase = createClient()
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('Error fetching user:', userError)
        return
      }

      if (!user) {
        setUser(null)
        setProfile(null)
        setPlan(null)
        return
      }

      setUser(user)

      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError)
      } else if (profile) {
        setProfile(profile)
      }

      // Fetch plan
      const { data: plan, error: planError } = await supabase
        .from('plans')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (planError && planError.code !== 'PGRST116') {
        console.error('Error fetching plan:', planError)
      } else if (plan) {
        setPlan(plan)
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
      toast.error('Error loading user data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const value = {
    user,
    profile,
    plan,
    loading,
    refreshUser,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}