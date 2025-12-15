import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UserProvider } from '@/components/user-provider'
import { SettingsForm } from '@/components/settings-form'

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <UserProvider>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </UserProvider>
  )
}