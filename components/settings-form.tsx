'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/components/user-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, User } from 'lucide-react'

const settingsSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
})

type SettingsForm = z.infer<typeof settingsSchema>

export function SettingsForm() {
  const { user, profile, refreshUser } = useUser()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
  })

  // Set initial values when profile loads
  React.useEffect(() => {
    if (profile) {
      setValue('fullName', profile.full_name || '')
      setValue('email', profile.email || user?.email || '')
    } else if (user?.email) {
      setValue('email', user.email)
    }
  }, [profile, user, setValue])

  const onSubmit = async (data: SettingsForm) => {
    setIsLoading(true)
    
    try {
      const supabase = createClient()
      
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          email: data.email,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id)

      if (profileError) {
        toast.error('Failed to update profile')
        console.error('Profile update error:', profileError)
        return
      }

      // If email changed, update auth user as well
      if (data.email !== user?.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: data.email,
        })

        if (authError) {
          toast.error('Failed to update email. Please try again.')
          console.error('Auth update error:', authError)
          return
        }
        
        toast.success('Profile updated! Please check your email to confirm any email changes.')
      } else {
        toast.success('Profile updated successfully!')
      }

      // Refresh user data
      await refreshUser()
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
      console.error('Settings update error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!profile && !user) {
    return <div>Loading...</div>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="John Doe"
          {...register('fullName')}
          className={errors.fullName ? 'border-red-500' : ''}
        />
        {errors.fullName && (
          <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          {...register('email')}
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Changing your email will require confirmation
        </p>
      </div>

      <div className="pt-4">
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <User className="mr-2 h-4 w-4" />
          Update Profile
        </Button>
      </div>
    </form>
  )
}