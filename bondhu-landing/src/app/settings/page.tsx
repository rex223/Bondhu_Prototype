"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  ChevronRight, 
  Settings, 
  User,
  Shield,
  Database,
  Download,
  Trash2,
  Bell,
  Lock,
  FileText,
  HelpCircle,
  Gamepad2,
  Video,
  Music,
  Brain,
  Sparkles,
  Layers,
  Clock,
  Heart,
  AlertTriangle,
  Check,
  X,
  Camera
} from "lucide-react"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import AnimatedLoader from "@/components/ui/animated-loader"
import type { Profile } from "@/types/auth"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { aiLearningEngine } from "@/lib/ai-learning-engine"
import Link from "next/link"
import { BottomNav } from "@/components/ui/bottom-nav"
import { motion, useInView } from "framer-motion"
import { cn } from "@/lib/utils"

// Scroll reveal component for settings
function ScrollReveal({ 
  children, 
  className,
  delay = 0 
}: { 
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: [0.25, 0.4, 0.25, 1] as const
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Toggle Switch Component with proper touch target
function ToggleSwitch({
  enabled,
  onChange,
  label
}: {
  enabled: boolean
  onChange: () => void
  label: string
}) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "relative min-w-[56px] h-[32px] rounded-full transition-all duration-300",
        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
        "touch-target",
        enabled 
          ? "bg-gradient-to-r from-emerald-500 to-teal-500" 
          : "bg-gray-200 dark:bg-gray-700"
      )}
      role="switch"
      aria-checked={enabled}
      aria-label={label}
    >
      <span
        className={cn(
          "absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300",
          enabled && "translate-x-6"
        )}
      />
    </button>
  )
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [deactivateStatus, setDeactivateStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [escapeStatus, setEscapeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [isDisappearing, setIsDisappearing] = useState(false)
  const [nameChangeStatus, setNameChangeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [avatarUploadStatus, setAvatarUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [newName, setNewName] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push('/sign-in')
          return
        }

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
  }, [supabase, router])

  const handleDeactivateAccount = async () => {
    if (!confirm('Are you sure you want to deactivate your account? Your data will be preserved for 30 days and you can reactivate anytime.')) {
      return
    }

    setDeactivateStatus('loading')
    try {
      // Update user profile to mark as deactivated
      const { error } = await supabase
        .from('profiles')
        .update({
          is_active: false,
          deactivated_at: new Date().toISOString()
        })
        .eq('id', profile?.id)

      if (error) {
        throw error
      }

      setDeactivateStatus('success')

      // Sign out user after deactivation
      setTimeout(async () => {
        await supabase.auth.signOut()
        router.push('/sign-in?message=Account deactivated successfully')
      }, 2000)

    } catch (error) {
      console.error('Deactivation failed:', error)
      setDeactivateStatus('error')
      setTimeout(() => setDeactivateStatus('idle'), 3000)
    }
  }

  const handleEscapeMatrix = async () => {
    if (!confirm('⚠️ ESCAPE THE MATRIX ⚠️\n\nThis will PERMANENTLY delete:\n• All your data\n• Your account\n• Everything from all systems\n\nThis cannot be undone. Are you absolutely sure?')) {
      return
    }

    // Proper text input dialog
    const confirmationText = prompt('Last chance! This action is IRREVERSIBLE.\n\nType "ESCAPE" (in capital letters) to confirm you want to delete everything forever:')

    if (confirmationText !== 'ESCAPE') {
      if (confirmationText !== null) { // User didn't cancel
        alert('❌ Confirmation failed. You must type "ESCAPE" exactly to proceed.')
      }
      return
    }

    setEscapeStatus('loading')
    setIsDisappearing(true)

    try {
      // Start the deletion process
      setTimeout(async () => {
        try {
          // First sign out the user to invalidate session
          await supabase.auth.signOut()

          // Delete all user data from profiles table
          const { error: profileError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', profile?.id)

          if (profileError) {
            console.error('Profile deletion error:', profileError)
          }

          // Call server-side API to delete user from Supabase Auth
          try {
            const response = await fetch('/api/delete-user', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ userId: profile?.id })
            })

            if (!response.ok) {
              console.error('Failed to delete user from auth system')
            }
          } catch (apiError) {
            console.error('API call failed:', apiError)
          }

          // Clear all local storage and cached data
          localStorage.clear()
          sessionStorage.clear()

          // Clear all cookies
          document.cookie.split(";").forEach((c) => {
            document.cookie = c
              .replace(/^ +/, "")
              .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
          })

          setEscapeStatus('success')

          // Redirect after animation completes
          setTimeout(() => {
            window.location.href = '/sign-in?message=Successfully escaped the matrix! 🎭✨'
          }, 2000)

        } catch (deletionError) {
          console.error('Matrix escape deletion failed:', deletionError)
          setEscapeStatus('error')
          setIsDisappearing(false)
          setTimeout(() => setEscapeStatus('idle'), 3000)
        }
      }, 3000) // Wait for disappearing animation

    } catch (error) {
      console.error('Matrix escape failed:', error)
      setEscapeStatus('error')
      setIsDisappearing(false)
      setTimeout(() => setEscapeStatus('idle'), 3000)
    }
  }

  const handleNameChange = async () => {
    if (!newName.trim()) {
      alert('Please enter a new name')
      return
    }

    if (newName.trim() === profile?.full_name) {
      alert('New name cannot be the same as current name')
      return
    }

    // Check if user can change name (30-day cooldown)
    const lastNameChange = profile?.last_name_change
    if (lastNameChange) {
      const lastChangeDate = new Date(lastNameChange)
      const daysSinceLastChange = Math.floor((Date.now() - lastChangeDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysSinceLastChange < 30) {
        const remainingDays = 30 - daysSinceLastChange
        alert(`You can change your name again in ${remainingDays} days. Last change was ${daysSinceLastChange} days ago.`)
        return
      }
    }

    if (!confirm(`Are you sure you want to change your name from "${profile?.full_name}" to "${newName.trim()}"?\n\nYou won't be able to change it again for 30 days.`)) {
      return
    }

    setNameChangeStatus('loading')
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: newName.trim(),
          last_name_change: new Date().toISOString()
        })
        .eq('id', profile?.id)

      if (error) {
        throw error
      }

      // Update local profile state
      setProfile(prev => prev ? {
        ...prev,
        full_name: newName.trim(),
        last_name_change: new Date().toISOString()
      } : null)

      setNameChangeStatus('success')
      setNewName('')
      setTimeout(() => setNameChangeStatus('idle'), 3000)

    } catch (error) {
      console.error('Name change failed:', error)
      setNameChangeStatus('error')
      setTimeout(() => setNameChangeStatus('idle'), 3000)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    setAvatarUploadStatus('loading')
    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${profile?.id}-${Date.now()}.${fileExt}`

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile?.id)

      if (updateError) {
        throw updateError
      }

      // Update local profile state
      setProfile(prev => prev ? {
        ...prev,
        avatar_url: publicUrl
      } : null)

      setAvatarUploadStatus('success')
      setTimeout(() => setAvatarUploadStatus('idle'), 3000)

    } catch (error) {
      console.error('Avatar upload failed:', error)
      setAvatarUploadStatus('error')
      setTimeout(() => setAvatarUploadStatus('idle'), 3000)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatedLoader size="lg" />
        </motion.div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
            <User className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mb-4">Profile not found</h1>
          <Button 
            onClick={() => router.push('/sign-in')}
            className="min-h-[48px] px-6"
          >
            Return to Sign In
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 relative",
      isDisappearing && "animate-pulse"
    )}>
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Thanos Snap Disappearing Animation Overlay */}
      {isDisappearing && (
        <motion.div 
          className="fixed inset-0 z-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
          {/* Dust particles animation */}
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gray-400 rounded-full"
              initial={{ 
                x: "50vw", 
                y: "50vh",
                opacity: 0.8 
              }}
              animate={{ 
                x: `${Math.random() * 100}vw`,
                y: `${Math.random() * 100}vh`,
                opacity: 0,
                scale: 0
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: "easeOut"
              }}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              className="text-center text-gray-700 dark:text-gray-300 z-10 px-4"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 3, ease: "easeInOut" }}
            >
              <div className="text-6xl mb-4">💨</div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Escaping the Matrix...</h2>
              <p className="text-base sm:text-lg opacity-70">Your digital existence is being erased...</p>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Header - Mobile First */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 pt-safe">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between gap-2">
            {/* Left: Back button */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => router.back()}
                className="h-10 w-10 sm:h-11 sm:w-11 rounded-full touch-target shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Go back</span>
              </Button>
              
              <Link href="/" className="hidden sm:flex items-center">
                <Logo width={120} height={44} />
              </Link>
            </div>

            {/* Center: Title (mobile only) */}
            <div className="flex-1 sm:hidden text-center">
              <h1 className="text-base font-semibold truncate">Settings</h1>
            </div>

            {/* Right: Theme toggle */}
            <div className="flex items-center">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pb-24 sm:pb-8 max-w-5xl">
        {/* Breadcrumb Navigation - Desktop */}
        <motion.div 
          className="hidden sm:flex items-center mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <button
              onClick={() => router.push('/dashboard')}
              className="hover:text-foreground transition-colors touch-target py-2"
            >
              Dashboard
            </button>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Privacy & Settings</span>
          </div>
        </motion.div>

        {/* Hero Section - Responsive */}
        <motion.div 
          className="mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-white/20 dark:border-white/10 backdrop-blur-sm">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 sm:w-64 sm:h-64 bg-gradient-to-bl from-blue-500/20 to-transparent rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-full blur-2xl" />
            
            <div className="relative p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                {/* Avatar with upload button */}
                <div className="relative group">
                  <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-white/50 dark:border-white/20 shadow-xl ring-4 ring-white/20">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <AvatarFallback className="text-xl sm:text-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                        {profile.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  {avatarUploadStatus === 'loading' && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <AnimatedLoader size="sm" />
                    </div>
                  )}
                  {/* Camera icon overlay */}
                  <label 
                    htmlFor="avatar-upload-hero"
                    className="absolute -bottom-1 -right-1 w-8 h-8 sm:w-9 sm:h-9 bg-primary rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform"
                  >
                    <Camera className="w-4 h-4 text-primary-foreground" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      id="avatar-upload-hero"
                      disabled={avatarUploadStatus === 'loading'}
                    />
                  </label>
                </div>
                
                {/* Text content */}
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-1 sm:mb-2">
                    Privacy & Settings
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 max-w-md">
                    Manage your data, privacy preferences, and account settings
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <Badge variant="secondary" className="bg-white/50 dark:bg-white/10 backdrop-blur-sm">
                      <Shield className="w-3 h-3 mr-1" />
                      Secure
                    </Badge>
                    <Badge variant="secondary" className="bg-white/50 dark:bg-white/10 backdrop-blur-sm">
                      <Lock className="w-3 h-3 mr-1" />
                      Private
                    </Badge>
                    <Badge variant="secondary" className="bg-white/50 dark:bg-white/10 backdrop-blur-sm">
                      Active since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </Badge>
                  </div>
                </div>

                {/* Settings icon - desktop only */}
                <div className="hidden lg:flex flex-col items-center justify-center text-center p-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg mb-2">
                    <Settings className="h-8 w-8 text-white" />
                  </div>
                  <span className="text-xs text-muted-foreground">Control Center</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Settings Content */}
        <SettingsPanel
          profile={profile}
          deactivateStatus={deactivateStatus}
          escapeStatus={escapeStatus}
          isDisappearing={isDisappearing}
          nameChangeStatus={nameChangeStatus}
          avatarUploadStatus={avatarUploadStatus}
          newName={newName}
          setNewName={setNewName}
          handleDeactivateAccount={handleDeactivateAccount}
          handleEscapeMatrix={handleEscapeMatrix}
          handleNameChange={handleNameChange}
          handleAvatarUpload={handleAvatarUpload}
          ScrollReveal={ScrollReveal}
          ToggleSwitch={ToggleSwitch}
        />
      </main>

      {/* Bottom Navigation - Mobile */}
      <BottomNav />
    </div>
  )
}

// Settings Panel Component - Redesigned with mobile-first approach
function SettingsPanel({
  profile,
  deactivateStatus,
  escapeStatus,
  isDisappearing,
  nameChangeStatus,
  avatarUploadStatus,
  newName,
  setNewName,
  handleDeactivateAccount,
  handleEscapeMatrix,
  handleNameChange,
  handleAvatarUpload,
  ScrollReveal,
  ToggleSwitch
}: {
  profile: Profile;
  deactivateStatus: 'idle' | 'loading' | 'success' | 'error';
  escapeStatus: 'idle' | 'loading' | 'success' | 'error';
  isDisappearing: boolean;
  nameChangeStatus: 'idle' | 'loading' | 'success' | 'error';
  avatarUploadStatus: 'idle' | 'loading' | 'success' | 'error';
  newName: string;
  setNewName: (name: string) => void;
  handleDeactivateAccount: () => void;
  handleEscapeMatrix: () => void;
  handleNameChange: () => void;
  handleAvatarUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  ScrollReveal: React.ComponentType<{ children: React.ReactNode; className?: string; delay?: number }>;
  ToggleSwitch: React.ComponentType<{ enabled: boolean; onChange: () => void; label: string }>;
}) {
  const [dataSettings, setDataSettings] = useState({
    gamingData: true,
    videoData: true,
    musicData: true,
    personalityAnalytics: true,
    aiRecommendations: true,
    crossModalInsights: true,
    dataRetention: 365,
    shareAnonymized: false,
    exportFormat: 'json'
  })

  const [exportStatus, setExportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [deleteStatus, setDeleteStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSettingChange = (setting: string, value: boolean | number | string) => {
    setDataSettings(prev => ({ ...prev, [setting]: value }))
  }

  const handleExportData = async () => {
    setExportStatus('loading')
    try {
      const exportData = aiLearningEngine.exportForExternalAnalysis()
      const fullExport = {
        profile: {
          id: profile.id,
          full_name: profile.full_name,
          created_at: profile.created_at,
          personality_data: profile.personality_data
        },
        entertainmentData: exportData,
        settings: dataSettings,
        exportDate: new Date().toISOString()
      }

      const blob = new Blob([JSON.stringify(fullExport, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bondhu-data-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setExportStatus('success')
      setTimeout(() => setExportStatus('idle'), 3000)
    } catch (error) {
      console.error('Export failed:', error)
      setExportStatus('error')
      setTimeout(() => setExportStatus('idle'), 3000)
    }
  }

  const handleDeleteData = async (dataType: 'gaming' | 'video' | 'music' | 'all') => {
    if (!confirm(`Are you sure you want to delete all ${dataType} data? This action cannot be undone.`)) {
      return
    }

    setDeleteStatus('loading')
    try {
      console.log('Deleting data type:', dataType)
      if (dataType === 'all') {
        console.log('All entertainment data deleted')
      }
      setDeleteStatus('success')
      setTimeout(() => setDeleteStatus('idle'), 3000)
    } catch (error) {
      console.error('Delete failed:', error)
      setDeleteStatus('error')
      setTimeout(() => setDeleteStatus('idle'), 3000)
    }
  }

  // Setting item component for consistency
  const SettingItem = ({ 
    icon: Icon, 
    title, 
    description, 
    enabled, 
    onToggle 
  }: { 
    icon: React.ElementType
    title: string
    description: string
    enabled: boolean
    onToggle: () => void
  }) => (
    <div className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10">
      <div className={cn(
        "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors",
        enabled 
          ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400" 
          : "bg-gray-100 dark:bg-gray-800 text-gray-400"
      )}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <h5 className="font-medium text-sm sm:text-base">{title}</h5>
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{description}</p>
      </div>
      <ToggleSwitch enabled={enabled} onChange={onToggle} label={title} />
    </div>
  )

  // Section card wrapper with glassmorphism
  const SectionCard = ({ 
    children, 
    icon: Icon, 
    title, 
    description,
    delay = 0
  }: { 
    children: React.ReactNode
    icon: React.ElementType
    title: string
    description?: string
    delay?: number
  }) => (
    <ScrollReveal delay={delay}>
      <div className="relative group">
        {/* Glow effect on hover */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20 rounded-2xl sm:rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-white/10 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold">{title}</h3>
                {description && (
                  <p className="text-sm text-muted-foreground">{description}</p>
                )}
              </div>
            </div>
          </div>
          {/* Content */}
          <div className="p-4 sm:p-6">
            {children}
          </div>
        </div>
      </div>
    </ScrollReveal>
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Profile Settings */}
      <SectionCard 
        icon={User} 
        title="Profile Settings" 
        description="Customize your profile appearance"
        delay={0}
      >
        <div className="space-y-6">
          {/* Name Change Section */}
          <div>
            <h4 className="font-medium text-sm sm:text-base mb-3">Display Name</h4>
            <div className="p-3 sm:p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 mb-3">
              <span className="text-xs text-muted-foreground">Current Name</span>
              <p className="font-semibold text-base sm:text-lg">{profile.full_name}</p>
            </div>
            
            {(() => {
              const lastNameChange = profile.last_name_change
              const canChangeName = !lastNameChange ||
                Math.floor((Date.now() - new Date(lastNameChange).getTime()) / (1000 * 60 * 60 * 24)) >= 30
              const daysSinceLastChange = lastNameChange ?
                Math.floor((Date.now() - new Date(lastNameChange).getTime()) / (1000 * 60 * 60 * 24)) : null
              const remainingDays = daysSinceLastChange !== null ? Math.max(0, 30 - daysSinceLastChange) : 0

              return (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Enter new display name"
                      className="flex-1 h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      disabled={!canChangeName || nameChangeStatus === 'loading'}
                    />
                    <Button
                      onClick={handleNameChange}
                      disabled={!canChangeName || !newName.trim() || nameChangeStatus === 'loading'}
                      className="h-12 px-6 rounded-xl min-w-[120px]"
                    >
                      {nameChangeStatus === 'loading' ? (
                        <AnimatedLoader size="sm" />
                      ) : nameChangeStatus === 'success' ? (
                        <><Check className="w-4 h-4 mr-2" /> Updated</>
                      ) : (
                        'Update Name'
                      )}
                    </Button>
                  </div>

                  {!canChangeName && remainingDays > 0 && (
                    <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>You can change your name again in {remainingDays} days</span>
                    </div>
                  )}

                  {canChangeName && (
                    <p className="text-xs text-muted-foreground">
                      You can change your name once every 30 days
                    </p>
                  )}
                </div>
              )
            })()}
          </div>
        </div>
      </SectionCard>

      {/* Entertainment Data Collection */}
      <SectionCard 
        icon={Database} 
        title="Data Collection" 
        description="Control what data Bondhu collects"
        delay={0.1}
      >
        <div className="space-y-3">
          <SettingItem
            icon={Gamepad2}
            title="Gaming Analytics"
            description="Track game choices, performance, and playing patterns"
            enabled={dataSettings.gamingData}
            onToggle={() => handleSettingChange('gamingData', !dataSettings.gamingData)}
          />
          <SettingItem
            icon={Video}
            title="Video Analytics"
            description="Monitor watch time and content preferences"
            enabled={dataSettings.videoData}
            onToggle={() => handleSettingChange('videoData', !dataSettings.videoData)}
          />
          <SettingItem
            icon={Music}
            title="Music Analytics"
            description="Analyze listening habits and mood patterns"
            enabled={dataSettings.musicData}
            onToggle={() => handleSettingChange('musicData', !dataSettings.musicData)}
          />
        </div>
      </SectionCard>

      {/* AI Features */}
      <SectionCard 
        icon={Brain} 
        title="AI Features" 
        description="Personalization and insights settings"
        delay={0.15}
      >
        <div className="space-y-3">
          <SettingItem
            icon={Brain}
            title="Personality Analytics"
            description="Generate Big Five insights from behavior patterns"
            enabled={dataSettings.personalityAnalytics}
            onToggle={() => handleSettingChange('personalityAnalytics', !dataSettings.personalityAnalytics)}
          />
          <SettingItem
            icon={Sparkles}
            title="AI Recommendations"
            description="Personalized content and activity suggestions"
            enabled={dataSettings.aiRecommendations}
            onToggle={() => handleSettingChange('aiRecommendations', !dataSettings.aiRecommendations)}
          />
          <SettingItem
            icon={Layers}
            title="Cross-Modal Insights"
            description="Patterns across different entertainment types"
            enabled={dataSettings.crossModalInsights}
            onToggle={() => handleSettingChange('crossModalInsights', !dataSettings.crossModalInsights)}
          />
          <SettingItem
            icon={Heart}
            title="Research Contribution"
            description="Share anonymized data for mental health AI research"
            enabled={dataSettings.shareAnonymized}
            onToggle={() => handleSettingChange('shareAnonymized', !dataSettings.shareAnonymized)}
          />
        </div>
      </SectionCard>

      {/* Data Retention & Export */}
      <SectionCard 
        icon={Clock} 
        title="Data Retention" 
        description="How long your data is stored"
        delay={0.2}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Keep my data for:</label>
            <select
              value={dataSettings.dataRetention}
              onChange={(e) => handleSettingChange('dataRetention', Number(e.target.value))}
              className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value={30}>30 days</option>
              <option value={90}>3 months</option>
              <option value={180}>6 months</option>
              <option value={365}>1 year</option>
              <option value={730}>2 years</option>
              <option value={-1}>Until I delete it</option>
            </select>
            <p className="text-xs text-muted-foreground mt-2">
              Older data is automatically deleted. Analysis and insights are preserved.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Data Management & Export */}
      <SectionCard 
        icon={Download} 
        title="Data Management" 
        description="Export or delete your data"
        delay={0.25}
      >
        <div className="space-y-4">
          {/* Export Section */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200/30 dark:border-blue-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium text-sm sm:text-base">Export Your Data</h4>
                  <p className="text-xs text-muted-foreground">Download all data in JSON format</p>
                </div>
              </div>
              <Button
                onClick={handleExportData}
                disabled={exportStatus === 'loading'}
                className="h-11 px-5 rounded-xl w-full sm:w-auto"
                variant={exportStatus === 'success' ? 'outline' : 'default'}
              >
                {exportStatus === 'loading' ? (
                  <><AnimatedLoader size="sm" /> Exporting...</>
                ) : exportStatus === 'success' ? (
                  <><Check className="w-4 h-4 mr-2 text-green-500" /> Exported!</>
                ) : (
                  <><Download className="w-4 h-4 mr-2" /> Export</>
                )}
              </Button>
            </div>
          </div>

          {/* Data Usage Stats */}
          <div className="p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10">
            <h4 className="font-medium text-sm mb-3">Data Usage Summary</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Sessions', value: '47', icon: Layers },
                { label: 'AI Insights', value: '23', icon: Brain },
                { label: 'Games', value: '12', icon: Gamepad2 },
                { label: 'Videos', value: '8', icon: Video },
                { label: 'Music', value: '27', icon: Music },
                { label: 'Data Size', value: '2.3 MB', icon: Database },
              ].map((stat, i) => (
                <div key={i} className="p-3 rounded-lg bg-white/50 dark:bg-white/5 text-center">
                  <stat.icon className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="font-semibold text-base">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Delete Data */}
          <div className="p-4 rounded-xl bg-red-500/5 border border-red-200/50 dark:border-red-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h4 className="font-medium text-red-700 dark:text-red-400 text-sm sm:text-base">Delete Data</h4>
                <p className="text-xs text-red-600/70 dark:text-red-400/70">This action cannot be undone</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['gaming', 'video', 'music', 'all'].map((type) => (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  className="h-10 text-xs sm:text-sm text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10"
                  onClick={() => handleDeleteData(type as 'gaming' | 'video' | 'music' | 'all')}
                  disabled={deleteStatus === 'loading'}
                >
                  {type === 'all' ? 'Delete All' : type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Account Settings */}
      <SectionCard 
        icon={Settings} 
        title="Account Settings" 
        description="Security and notifications"
        delay={0.3}
      >
        <div className="space-y-3">
          {/* Account Status */}
          <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h5 className="font-medium text-sm sm:text-base">Account Status</h5>
                <p className="text-xs text-muted-foreground">Active since {new Date(profile.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-0">Active</Badge>
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h5 className="font-medium text-sm sm:text-base">Email Notifications</h5>
                <p className="text-xs text-muted-foreground">Weekly insights and recommendations</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl">Configure</Button>
          </div>

          {/* 2FA */}
          <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h5 className="font-medium text-sm sm:text-base">Two-Factor Auth</h5>
                <p className="text-xs text-muted-foreground">Additional account security</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl">Enable</Button>
          </div>
        </div>
      </SectionCard>

      {/* Danger Zone */}
      <ScrollReveal delay={0.35}>
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-red-500/5 via-orange-500/5 to-red-500/5 border border-red-200/50 dark:border-red-500/20">
          <div className="p-4 sm:p-6 border-b border-red-200/30 dark:border-red-500/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-red-700 dark:text-red-400">Danger Zone</h3>
                <p className="text-sm text-red-600/70 dark:text-red-400/70">Irreversible account actions</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 sm:p-6 space-y-4">
            {/* Deactivate Account */}
            <div className="p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-red-200/30 dark:border-red-500/10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h4 className="font-medium text-red-700 dark:text-red-400">Deactivate Account</h4>
                  <p className="text-xs text-muted-foreground">Your data will be preserved for 30 days</p>
                </div>
                <Button
                  variant="outline"
                  className="h-11 px-5 rounded-xl text-red-600 border-red-200 hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10 w-full sm:w-auto"
                  onClick={handleDeactivateAccount}
                  disabled={deactivateStatus === 'loading'}
                >
                  {deactivateStatus === 'loading' ? (
                    <><AnimatedLoader size="sm" /> Deactivating...</>
                  ) : deactivateStatus === 'success' ? (
                    <><Check className="w-4 h-4 mr-2" /> Deactivated</>
                  ) : (
                    'Deactivate'
                  )}
                </Button>
              </div>
            </div>

            {/* Escape the Matrix */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-300/50 dark:border-red-500/30">
              <div className="text-center mb-4">
                <h4 className="font-bold text-red-700 dark:text-red-400 mb-1">⚠️ Nuclear Option ⚠️</h4>
                <p className="text-xs text-red-600/80 dark:text-red-400/80">
                  Complete digital erasure - no coming back from this
                </p>
              </div>
              <Button
                variant="destructive"
                className="w-full h-12 sm:h-14 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold text-sm sm:text-base relative overflow-hidden group"
                onClick={handleEscapeMatrix}
                disabled={escapeStatus === 'loading' || isDisappearing}
              >
                <span className="relative z-10 flex items-center justify-center">
                  {escapeStatus === 'loading' ? (
                    <><AnimatedLoader size="sm" /> Initiating Matrix Escape...</>
                  ) : escapeStatus === 'success' ? (
                    '✨ Escaped Successfully ✨'
                  ) : (
                    '🔴 ESCAPE THE MATRIX 🔴'
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-700 via-orange-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
              <p className="text-xs text-red-700 dark:text-red-400 mt-3 text-center font-medium">
                Permanently deletes EVERYTHING - Account, data, existence
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Privacy Information */}
      <SectionCard 
        icon={Shield} 
        title="Privacy Information" 
        description="How we handle your data"
        delay={0.4}
      >
        <div className="space-y-4">
          {[
            {
              icon: Lock,
              title: 'Data Processing',
              description: 'Your data is processed locally and encrypted before storage. AI analysis happens on secure servers with strict access controls.'
            },
            {
              icon: Heart,
              title: 'Data Sharing',
              description: 'We never sell personal data. Anonymized research contributions are optional and help improve mental health AI.'
            },
            {
              icon: FileText,
              title: 'Your Rights',
              description: 'You can access, correct, delete, or port your data at any time. Contact support for assistance.'
            },
          ].map((item, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-xl bg-white/30 dark:bg-white/5">
              <item.icon className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <h5 className="font-medium text-sm">{item.title}</h5>
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-white/10 dark:border-white/5">
            <div className="flex flex-wrap gap-2">
              <Link href="/privacy-policy">
                <Button variant="ghost" size="sm" className="h-10 rounded-xl text-xs sm:text-sm">
                  <FileText className="w-4 h-4 mr-2" /> Privacy Policy
                </Button>
              </Link>
              <Link href="/terms-of-service">
                <Button variant="ghost" size="sm" className="h-10 rounded-xl text-xs sm:text-sm">
                  <FileText className="w-4 h-4 mr-2" /> Terms of Service
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="h-10 rounded-xl text-xs sm:text-sm">
                <HelpCircle className="w-4 h-4 mr-2" /> Contact Support
              </Button>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Toast Notifications */}
      {(exportStatus === 'success' || deleteStatus === 'success' || deactivateStatus === 'success' || escapeStatus === 'success' || nameChangeStatus === 'success' || avatarUploadStatus === 'success') && (
        <motion.div 
          className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div className="p-4 rounded-2xl bg-emerald-500/90 backdrop-blur-xl shadow-lg border border-emerald-400/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-medium text-sm">
                {exportStatus === 'success' ? 'Data exported successfully!' :
                  deleteStatus === 'success' ? 'Data deleted successfully!' :
                    deactivateStatus === 'success' ? 'Account deactivated!' :
                      escapeStatus === 'success' ? '✨ Escaped the matrix! ✨' :
                        nameChangeStatus === 'success' ? 'Name updated!' :
                          avatarUploadStatus === 'success' ? 'Avatar updated!' : ''}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {(exportStatus === 'error' || deleteStatus === 'error' || deactivateStatus === 'error' || escapeStatus === 'error' || nameChangeStatus === 'error' || avatarUploadStatus === 'error') && (
        <motion.div 
          className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div className="p-4 rounded-2xl bg-red-500/90 backdrop-blur-xl shadow-lg border border-red-400/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <X className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-medium text-sm">
                {escapeStatus === 'error' ? 'Matrix escape failed!' :
                  nameChangeStatus === 'error' ? 'Name change failed' :
                    avatarUploadStatus === 'error' ? 'Upload failed' :
                      'Operation failed'}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}