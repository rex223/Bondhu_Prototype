"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Settings,
  Brain,
  TrendingUp,
  ChevronRight,
  LogOut
} from "lucide-react"
import AnimatedLoader from "@/components/ui/animated-loader"
import type { Profile } from "@/types/auth"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { BottomNav } from "@/components/ui/bottom-nav"
import { EmotionalOrb } from "@/components/ui/emotional-orb"
import Link from "next/link"

// Create Supabase client outside component to avoid re-creating on every render
const supabase = createClient()

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activityStats, setActivityStats] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push('/sign-in')
          return
        }

        setUserEmail(user.email || null)

        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching profile:', error)
          return
        }

        setProfile(profileData)

        // Fetch activity stats
        const response = await fetch('/api/activity-stats')
        if (response.ok) {
          const stats = await response.json()
          setActivityStats(stats)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array - runs once on mount

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <AnimatedLoader size="lg" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
          <Button onClick={() => router.push('/sign-in')}>
            Return to Sign In
          </Button>
        </div>
      </div>
    )
  }

  const menuItems = [
    {
      icon: Brain,
      label: "Personality Insights",
      description: "View your personality analysis",
      href: "/personality-insights",
      color: "text-purple-500",
    },
    {
      icon: TrendingUp,
      label: "Your Progress",
      description: "Track your wellness journey",
      href: "/dashboard",
      color: "text-emerald-500",
    },
    {
      icon: Settings,
      label: "Settings & Privacy",
      description: "Manage your account",
      href: "/settings",
      color: "text-slate-500",
    },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex h-14 items-center justify-between px-4 max-w-lg mx-auto">
          <Link href="/" className="flex items-center">
            <Logo width={100} height={36} />
          </Link>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full pb-bottom-nav">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              {profile.avatar_url && (
                <AvatarImage
                  src={profile.avatar_url}
                  alt={profile.full_name || 'User avatar'}
                />
              )}
              <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                {profile.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1">
              <EmotionalOrb emotion="happy" size="sm" />
            </div>
          </div>

          <h1 className="text-xl font-bold">{profile.full_name}</h1>
          <p className="text-sm text-muted-foreground">{userEmail}</p>

          {/* Quick Stats */}
          <div className="flex gap-6 mt-4">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">
                {activityStats?.currentStreakDays || 0}
              </div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-primary">
                {activityStats?.totalMessages || 0}
              </div>
              <div className="text-xs text-muted-foreground">Messages</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-primary">
                {activityStats?.wellnessScore || 0}%
              </div>
              <div className="text-xs text-muted-foreground">Wellness</div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Sign Out */}
        <div className="mt-8">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Account Info */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>Member since {new Date(profile.created_at).toLocaleDateString()}</p>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
