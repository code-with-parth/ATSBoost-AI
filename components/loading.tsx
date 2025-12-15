import React from 'react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  }

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-2", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
          sizeClasses[size]
        )}
      />
      {text && (
        <p className="text-sm text-gray-600">{text}</p>
      )}
    </div>
  )
}

export function LoadingPage({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-96">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}

export function LoadingCard({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="bg-gray-200 rounded h-4 w-full mb-2"></div>
      <div className="bg-gray-200 rounded h-4 w-3/4 mb-2"></div>
      <div className="bg-gray-200 rounded h-4 w-1/2"></div>
    </div>
  )
}

interface ButtonLoadingProps {
  children: React.ReactNode
  loading?: boolean
  className?: string
  disabled?: boolean
}

export function ButtonLoading({ children, loading, className, disabled }: ButtonLoadingProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {loading && (
        <div className="h-4 w-4 border-2 border-gray-300 border-t-current rounded-full animate-spin" />
      )}
      <span className={loading ? "opacity-70" : ""}>{children}</span>
    </div>
  )
}