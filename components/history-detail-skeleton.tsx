import React from 'react'
import { Card, CardContent, CardHeader } from './card'

export function HistoryDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Back button skeleton */}
      <div className="h-9 w-32 bg-gray-200 rounded animate-pulse" />

      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-5 w-96 bg-gray-100 rounded animate-pulse" />
      </div>

      {/* Status card skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-6 w-2/3 bg-gray-200 rounded animate-pulse" />
              <div className="flex gap-4">
                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content skeleton */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job description skeleton */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>

          {/* Results skeleton */}
          <Card>
            <CardHeader>
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-16 bg-blue-50 rounded animate-pulse" />
              <div className="text-center py-4">
                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mx-auto mb-2" />
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mx-auto" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 bg-gray-100 rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar skeleton */}
        <div className="space-y-6">
          {/* Quick actions skeleton */}
          <Card>
            <CardHeader>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-9 bg-gray-100 rounded animate-pulse" />
              <div className="h-9 bg-gray-100 rounded animate-pulse" />
              <div className="h-9 bg-gray-100 rounded animate-pulse" />
            </CardContent>
          </Card>

          {/* Downloads skeleton */}
          <Card>
            <CardHeader>
              <div className="space-y-1">
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-9 bg-gray-100 rounded animate-pulse" />
              <div className="h-9 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-9 bg-gray-100 rounded animate-pulse" />
            </CardContent>
          </Card>

          {/* Analysis info skeleton */}
          <Card>
            <CardHeader>
              <div className="h-6 w-28 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                <div className="h-6 w-12 bg-gray-100 rounded animate-pulse" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                <div className="h-6 w-16 bg-gray-100 rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}