import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkUserQuota } from '@/lib/quota'

export async function GET(request: Request) {
  try {
    const supabase = createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const quota = await checkUserQuota(user.id)

    return NextResponse.json(quota)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch quota'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
