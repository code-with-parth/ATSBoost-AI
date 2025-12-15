import React from 'react'
import { Card, CardContent } from './card'
import { Button } from './button'
import { FileText, BarChart3, Plus, Upload } from 'lucide-react'
import Link from 'next/link'

export function HistoryEmptyState() {
  return (
    <Card>
      <CardContent className="pt-12 pb-12">
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          {/* Title and Description */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">
              No analysis history yet
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Start by uploading your resume and analyzing it against job descriptions 
              to see your optimization history here.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link href="/dashboard/analyze">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Start First Analysis
              </Button>
            </Link>
            
            <Link href="/dashboard">
              <Button variant="outline" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <div className="pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-400">
              Need help getting started? Check out our{' '}
              <Link href="/help" className="text-blue-600 hover:text-blue-700 underline">
                getting started guide
              </Link>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function EmptyState({ 
  title, 
  description, 
  actionText, 
  actionLink, 
  icon = FileText 
}: {
  title: string
  description: string
  actionText: string
  actionLink: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  const Icon = icon

  return (
    <Card>
      <CardContent className="pt-12 pb-12">
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
              <Icon className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          {/* Title and Description */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">
              {title}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {description}
            </p>
          </div>

          {/* Action Button */}
          <div>
            <Link href={actionLink}>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {actionText}
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}