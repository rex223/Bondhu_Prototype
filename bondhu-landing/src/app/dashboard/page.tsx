"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Profile } from "@/types/auth"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { EnhancedChat } from "@/components/ui/enhanced-chat"
import AnimatedLoader from "@/components/ui/animated-loader"
import Link from "next/link"
import { BondhuBlob, type BlobEmotion } from "@/components/ui/bondhu-blob"
import { BottomNav } from "@/components/ui/bottom-nav"
import { VoiceModeModal } from "@/components/voice-mode"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [orbEmotion, setOrbEmotion] = useState<BlobEmotion>("neutral")
  const [isVoiceModeOpen, setIsVoiceModeOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const chatRefreshKey = useRef(0)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push('/sign-in')
          return
        }

        setUserId(user.id)
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
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getProfile()
  }, [router])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  // Callback to update orb emotion from chat component
  const handleEmotionChange = useCallback((emotion: BlobEmotion) => {
    setOrbEmotion(emotion)
  }, [])

  // Handle orb click to open voice mode
  const handleOrbClick = useCallback(() => {
    setIsVoiceModeOpen(true)
    setOrbEmotion("focused")
  }, [])

  // Handle closing voice mode
  const handleVoiceModeClose = useCallback(() => {
    setIsVoiceModeOpen(false)
    setOrbEmotion("neutral")
  }, [])

  // Handle switching from voice to chat
  const handleSwitchToChat = useCallback(() => {
    setIsVoiceModeOpen(false)
    setOrbEmotion("neutral")
    // Refresh chat to show new messages from voice mode
    chatRefreshKey.current += 1
  }, [])

  // Handle voice transcription for storage
  const handleVoiceTranscription = useCallback(async (text: string, isUser: boolean) => {
    if (!userId) return

    try {
      // Get the current session token
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        console.error('No auth token available for voice transcription')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/voice/transcription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          text,
          is_user: isUser,
          session_id: null, // Voice mode uses its own session tracking
          mood_detected: null,
          sentiment_score: null
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to store voice transcription:', errorData)
      }
    } catch (error) {
      console.error('Failed to store voice transcription:', error)
    }
  }, [userId])

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal Header */}
      <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex h-14 items-center justify-between px-4 max-w-4xl mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Logo width={100} height={36} />
          </Link>

          {/* Center - Bondhu Blob (Click for Voice Mode) */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <BondhuBlob
              emotion={orbEmotion}
              size="sm"
              isListening={isVoiceModeOpen}
              onClick={handleOrbClick}
            />
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full">
                  <Avatar className="h-8 w-8">
                    {profile.avatar_url && (
                      <AvatarImage
                        src={profile.avatar_url}
                        alt={profile.full_name || 'User avatar'}
                      />
                    )}
                    <AvatarFallback className="text-xs">
                      {profile.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{profile.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  Profile & Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/personality-insights')}>
                  Personality Insights
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content - Full Width Chat */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full pb-bottom-nav">
        <EnhancedChat
          key={chatRefreshKey.current}
          profile={profile}
          onEmotionChange={handleEmotionChange}
          fullScreen={true}
        />
      </main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Voice Mode Modal */}
      {userId && (
        <VoiceModeModal
          isOpen={isVoiceModeOpen}
          onClose={handleVoiceModeClose}
          onSwitchToChat={handleSwitchToChat}
          userId={userId}
          onTranscription={handleVoiceTranscription}
          onEmotionChange={handleEmotionChange}
          initialEmotion={orbEmotion}
        />
      )}
    </div>
  )
}
