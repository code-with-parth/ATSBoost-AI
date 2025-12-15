import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface SimpleChartProps {
  title: string
  data: { label: string; value: number; color?: string }[]
  height?: number
  showGrid?: boolean
}

export function SimpleChart({ title, data, height = 200, showGrid = true }: SimpleChartProps) {
  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))
  const range = maxValue - minValue || 1

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative" style={{ height }}>
          {/* Grid lines */}
          {showGrid && (
            <div className="absolute inset-0 flex flex-col justify-between">
              {[0, 1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="border-t border-gray-100"
                  style={{
                    transform: `translateY(${(i / 4) * 100}%)`,
                  }}
                />
              ))}
            </div>
          )}
          
          {/* Chart bars */}
          <div className="absolute inset-0 flex items-end justify-around px-4">
            {data.map((item, index) => {
              const percentage = ((item.value - minValue) / range) * 100
              const heightPercent = Math.max(percentage, 5) // Minimum 5% height for visibility
              
              return (
                <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                  <div className="text-xs font-medium text-gray-600">
                    {item.value}
                  </div>
                  <div
                    className="w-8 bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <div className="text-xs text-gray-500 text-center">
                    {item.label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface TrendIndicatorProps {
  value: number
  label: string
  previousValue?: number
  type?: 'positive' | 'negative' | 'neutral'
  size?: 'sm' | 'md' | 'lg'
}

export function TrendIndicator({ 
  value, 
  label, 
  previousValue, 
  type = 'neutral',
  size = 'md'
}: TrendIndicatorProps) {
  const getTrendIcon = () => {
    if (previousValue === undefined) return null
    
    const diff = value - previousValue
    switch (type) {
      case 'positive':
        return <TrendingUp className={`text-green-600 ${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'}`} />
      case 'negative':
        return <TrendingDown className={`text-red-600 ${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'}`} />
      default:
        return <Minus className={`text-gray-400 ${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'}`} />
    }
  }

  const getTrendColor = () => {
    switch (type) {
      case 'positive':
        return 'text-green-600 bg-green-50'
      case 'negative':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const percentageChange = previousValue 
    ? ((value - previousValue) / previousValue * 100).toFixed(1)
    : null

  const sizeClasses = {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6'
  }

  const valueClasses = {
    sm: 'text-xl',
    md: 'text-2xl', 
    lg: 'text-3xl'
  }

  return (
    <Card className={sizeClasses[size]}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className={`font-bold text-gray-900 ${valueClasses[size]}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        {previousValue !== undefined && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{percentageChange}%</span>
          </div>
        )}
      </div>
    </Card>
  )
}

interface ProgressRingProps {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  children?: React.ReactNode
}

export function ProgressRing({
  percentage,
  size = 120,
  strokeWidth = 8,
  color = '#3b82f6',
  backgroundColor = '#f3f4f6',
  children
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (
          <span className="text-lg font-semibold text-gray-900">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    type: 'positive' | 'negative' | 'neutral'
  }
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}

export function MetricCard({ title, value, subtitle, icon, trend, color = 'blue' }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600'
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-full ${colorClasses[color]}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
        {trend && (
          <div className="flex items-center mt-2 space-x-1">
            {trend.type === 'positive' ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : trend.type === 'negative' ? (
              <TrendingDown className="h-3 w-3 text-red-600" />
            ) : (
              <Minus className="h-3 w-3 text-gray-400" />
            )}
            <span className={`text-xs font-medium ${
              trend.type === 'positive' ? 'text-green-600' :
              trend.type === 'negative' ? 'text-red-600' : 'text-gray-400'
            }`}>
              {Math.abs(trend.value)}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}