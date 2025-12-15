import { getDashboardMetrics } from '@/lib/dashboard'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { SimpleChart, MetricCard, TrendIndicator, ProgressRing } from '@/components/charts'
import { 
  FileText, 
  TrendingUp, 
  Users, 
  Calendar,
  Zap,
  Crown,
  Building,
  Target,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  try {
    const metrics = await getDashboardMetrics(user.id)

    // Generate chart data for the last 7 days
    const chartData = generateWeeklyChartData(metrics)

    return (
      <div className="space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="mt-2 text-gray-600">
            Track your resume optimization progress and analytics
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Resumes"
            value={metrics.totalResumes}
            subtitle="Resumes uploaded"
            icon={<FileText className="h-4 w-4" />}
            color="blue"
            trend={{ value: 12, type: 'positive' }}
          />
          
          <MetricCard
            title="Total Analyses"
            value={metrics.totalAnalyses}
            subtitle="Optimizations completed"
            icon={<BarChart3 className="h-4 w-4" />}
            color="green"
            trend={{ value: 8, type: 'positive' }}
          />
          
          <MetricCard
            title="Profile Views"
            value={metrics.profileViews}
            subtitle="Recruiter interactions"
            icon={<Users className="h-4 w-4" />}
            color="purple"
            trend={{ value: 15, type: 'positive' }}
          />
          
          <MetricCard
            title="Avg. ATS Score"
            value={`${metrics.averageAtsScore}%`}
            subtitle="Performance rating"
            icon={<Target className="h-4 w-4" />}
            color="orange"
            trend={{ value: 5, type: 'positive' }}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SimpleChart
            title="Weekly Performance"
            data={chartData}
            height={250}
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Monthly Usage</CardTitle>
              <CardDescription>
                Your current plan usage this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-6">
                <ProgressRing 
                  percentage={metrics.usageData.percentage}
                  size={100}
                  color={metrics.usageData.percentage > 80 ? '#ef4444' : '#3b82f6'}
                />
                <div className="space-y-2">
                  <div className="text-sm font-medium">Usage Progress</div>
                  <div className="text-2xl font-bold">
                    {metrics.usageData.thisMonthUsage} / {metrics.usageData.monthlyLimit}
                  </div>
                  <div className="text-sm text-gray-500">
                    {metrics.usageData.monthlyLimit - metrics.usageData.thisMonthUsage} remaining
                  </div>
                  {metrics.usageData.percentage > 80 && (
                    <Badge variant="destructive" className="text-xs">
                      Approaching limit
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plan Information & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getPlanIcon(metrics.planInfo.planType)}
                Current Plan
              </CardTitle>
              <CardDescription>
                Manage your subscription and usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Plan Type</span>
                <Badge className={getPlanColor(metrics.planInfo.planType)}>
                  {metrics.planInfo.planType.toUpperCase()}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Monthly Usage</span>
                  <span>{metrics.usageData.thisMonthUsage} / {metrics.usageData.monthlyLimit}</span>
                </div>
                <Progress value={metrics.usageData.percentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {metrics.usageData.monthlyLimit - metrics.usageData.thisMonthUsage} optimizations remaining
                </p>
              </div>

              <div className="pt-4">
                {metrics.planInfo.planType === 'free' ? (
                  <Link href="/settings">
                    <Button className="w-full">
                      Upgrade to Pro
                    </Button>
                  </Link>
                ) : (
                  <Link href="/settings">
                    <Button variant="outline" className="w-full">
                      Manage Subscription
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Get started with these common tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/analyze" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Boost New Resume
                </Button>
              </Link>
              
              <Link href="/dashboard/history" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analysis History
                </Button>
              </Link>
              
              <Link href="/settings" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Crown className="mr-2 h-4 w-4" />
                  Update Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest resume optimizations and profile interactions
              </CardDescription>
            </div>
            <Link href="/dashboard/history">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {metrics.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {metrics.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {activity.type.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No recent activity</p>
                <Link href="/dashboard/analyze" className="mt-2 inline-block">
                  <Button variant="outline" size="sm">
                    Start Your First Analysis
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error('Dashboard error:', error)
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Unable to load dashboard data</p>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">There was an error loading your dashboard.</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
}

function generateWeeklyChartData(metrics: any) {
  // Generate mock weekly data based on current metrics
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const baseValue = Math.max(metrics.thisMonthAnalyses / 7, 1)
  
  return days.map(day => ({
    label: day,
    value: Math.max(0, Math.round(baseValue + (Math.random() - 0.5) * baseValue))
  }))
}

function getPlanIcon(planType: string) {
  switch (planType) {
    case 'pro':
      return <Crown className="h-5 w-5 text-yellow-500" />
    case 'enterprise':
      return <Building className="h-5 w-5 text-purple-500" />
    default:
      return <Zap className="h-5 w-5 text-blue-500" />
  }
}

function getPlanColor(planType: string) {
  switch (planType) {
    case 'pro':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'enterprise':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    default:
      return 'bg-blue-100 text-blue-800 border-blue-200'
  }
}