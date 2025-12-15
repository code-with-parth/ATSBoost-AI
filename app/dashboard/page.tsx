import { useUser } from '@/components/user-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  FileText, 
  TrendingUp, 
  Users, 
  Calendar,
  Zap,
  Crown,
  Building
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, profile, plan, loading } = useUser()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'pro':
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 'enterprise':
        return <Building className="h-5 w-5 text-purple-500" />
      default:
        return <Zap className="h-5 w-5 text-blue-500" />
    }
  }

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'pro':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  // Mock usage data - in real app, this would come from usage_tracking table
  const usageData = {
    resumesBoosted: 23,
    monthlyLimit: 25,
    thisMonthUsage: 8,
    profileViews: 156,
  }

  const usagePercentage = (usageData.thisMonthUsage / usageData.monthlyLimit) * 100

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.full_name || 'there'}!
        </h1>
        <p className="mt-2 text-gray-600">
          Ready to boost your resume game today?
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Resumes Boosted
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageData.resumesBoosted}</div>
            <p className="text-xs text-muted-foreground">
              Total optimizations completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Profile Views
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageData.profileViews}</div>
            <p className="text-xs text-muted-foreground">
              People viewed your profile
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              This Month
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageData.thisMonthUsage}</div>
            <p className="text-xs text-muted-foreground">
              Optimizations this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Days Active
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Days since you joined
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Plan Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getPlanIcon(plan?.plan_type || 'free')}
              Current Plan
            </CardTitle>
            <CardDescription>
              Manage your subscription and usage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Plan Type</span>
              <Badge className={getPlanColor(plan?.plan_type || 'free')}>
                {(plan?.plan_type || 'free').toUpperCase()}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Monthly Usage</span>
                <span>{usageData.thisMonthUsage} / {usageData.monthlyLimit}</span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {usageData.monthlyLimit - usageData.thisMonthUsage} optimizations remaining
              </p>
            </div>

            <div className="pt-4">
              {plan?.plan_type === 'free' ? (
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
            <Button variant="outline" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              View Profile Analytics
            </Button>
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
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest resume optimizations and profile interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Resume optimized for Software Engineer role</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Profile viewed by recruiter at Tech Corp</p>
                <p className="text-xs text-muted-foreground">5 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Increased profile visibility score by 15%</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}