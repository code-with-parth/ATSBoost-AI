import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ConfirmPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const supabase = createClient()
        
        // Handle the email confirmation
        const { data, error } = await supabase.auth.exchangeCodeForSession(
          searchParams.get('code') || ''
        )

        if (error) {
          console.error('Email confirmation error:', error)
          setStatus('error')
          setMessage(error.message)
          toast.error('Email confirmation failed')
        } else {
          setStatus('success')
          setMessage('Email confirmed successfully! You can now sign in to your account.')
          toast.success('Email confirmed successfully!')
          
          // Redirect to login after a short delay
          setTimeout(() => {
            router.push('/auth/login?message=email-confirmed')
          }, 3000)
        }
      } catch (error) {
        console.error('Unexpected error:', error)
        setStatus('error')
        setMessage('An unexpected error occurred. Please try again.')
        toast.error('Something went wrong')
      }
    }

    if (searchParams.get('code')) {
      handleEmailConfirmation()
    } else {
      setStatus('error')
      setMessage('Invalid confirmation link.')
    }
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            {status === 'loading' && (
              <>
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
                <CardTitle>Confirming your email</CardTitle>
                <CardDescription>
                  Please wait while we confirm your email address...
                </CardDescription>
              </>
            )}
            
            {status === 'success' && (
              <>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-green-900">Email Confirmed!</CardTitle>
                <CardDescription>
                  {message}
                </CardDescription>
              </>
            )}
            
            {status === 'error' && (
              <>
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-red-900">Confirmation Failed</CardTitle>
                <CardDescription>
                  {message}
                </CardDescription>
              </>
            )}
          </CardHeader>
          
          <CardContent>
            {status === 'success' && (
              <div className="space-y-4">
                <p className="text-sm text-center text-muted-foreground">
                  Redirecting you to sign in...
                </p>
                <Link href="/auth/login">
                  <Button className="w-full">
                    Continue to Sign In
                  </Button>
                </Link>
              </div>
            )}
            
            {status === 'error' && (
              <div className="space-y-4">
                <p className="text-sm text-center text-muted-foreground">
                  Please try signing up again or contact support if the problem persists.
                </p>
                <Link href="/auth/signup">
                  <Button variant="outline" className="w-full">
                    Try Again
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="ghost" className="w-full">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}