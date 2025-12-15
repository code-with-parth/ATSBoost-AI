import React from 'react'
import { Button } from './button'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
  showPrevNext?: boolean
  maxVisible?: number
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisible = 7,
  className
}: PaginationProps) {
  const getVisiblePages = () => {
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const half = Math.floor(maxVisible / 2)
    let start = Math.max(1, currentPage - half)
    let end = Math.min(totalPages, start + maxVisible - 1)

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }

    const pages = []
    
    if (showFirstLast && start > 1) {
      pages.push(1)
      if (start > 2) {
        pages.push('ellipsis-start')
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (showFirstLast && end < totalPages) {
      if (end < totalPages - 1) {
        pages.push('ellipsis-end')
      }
      pages.push(totalPages)
    }

    return pages
  }

  if (totalPages <= 1) return null

  const visiblePages = getVisiblePages()

  return (
    <nav 
      className={cn(
        "flex items-center justify-center space-x-1",
        className
      )}
      aria-label="Pagination"
    >
      {/* Previous Button */}
      {showPrevNext && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>
      )}

      {/* Page Numbers */}
      {visiblePages.map((page, index) => {
        if (page === 'ellipsis-start' || page === 'ellipsis-end') {
          return (
            <div
              key={`ellipsis-${index}`}
              className="flex items-center justify-center w-8 h-8"
            >
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </div>
          )
        }

        const pageNumber = page as number
        const isActive = pageNumber === currentPage

        return (
          <Button
            key={pageNumber}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(pageNumber)}
            className={cn(
              "h-8 w-8 p-0",
              isActive && "bg-blue-600 text-white hover:bg-blue-700"
            )}
            aria-label={`Go to page ${pageNumber}`}
            aria-current={isActive ? "page" : undefined}
          >
            {pageNumber}
          </Button>
        )
      })}

      {/* Next Button */}
      {showPrevNext && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>
      )}
    </nav>
  )
}

interface PaginationInfoProps {
  currentPage: number
  pageSize: number
  totalItems: number
  showInfo?: boolean
  className?: string
}

export function PaginationInfo({
  currentPage,
  pageSize,
  totalItems,
  showInfo = true,
  className
}: PaginationInfoProps) {
  if (!showInfo || totalItems === 0) return null

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div 
      className={cn(
        "flex items-center justify-between text-sm text-gray-500",
        className
      )}
      aria-live="polite"
    >
      <span>
        Showing {startItem} to {endItem} of {totalItems.toLocaleString()} results
      </span>
    </div>
  )
}