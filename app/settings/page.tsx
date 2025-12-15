import { useUser } from '@/components/user-provider'
import { SettingsForm } from '@/components/settings-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  User, 
  Mail, 
  Calendar,
  Crown,
  Zap,
  Building,
  BarChart3
} from 'lucide-react'

export default function SettingsPage() {
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

  // Mock usage data
  const usageData = {
    resumesBoosted: 23,
    monthlyLimit: plan?.plan_type === 'free' ? 25 : plan?.plan_type === 'pro' ? 100 : 500,
    thisMonthUsage: 8,
    profileViews: 156,
  }

  const usagePercentage = (usageData.thisMonthUsage / usageData.monthlyLimit) * 100

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
                    <AvatarFallback className="text-lg">
                      {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle>{profile?.full_name || 'User'}</CardTitle>
                <CardDescription className="flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user?.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Plan</span>
                  <Badge className={getPlanColor(plan?.plan_type || 'free')}>
                    <span className="flex items-center gap-1">
                      {getPlanIcon(plan?.plan_type || 'free')}
                      {(plan?.plan_type || 'free').toUpperCase()}
                    </span>
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Member Since</span>
                  <span className="text-sm text-muted-foreground">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Recently'}
                  </span>
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
              </CardContent>
            </Card>
          </div>

          {/* Settings Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your profile information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SettingsForm />
              </CardContent>
            </Card>

            {/* Account Statistics */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Account Statistics
                </CardTitle>
                <CardDescription>
                  Your account usage and activity overview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{usageData.resumesBoosted}</div>
                    <div className="text-sm text-muted-foreground">Resumes Optimized</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{usageData.profileViews}</div>
                    <div className="text-sm text-muted-foreground">Profile Views</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}