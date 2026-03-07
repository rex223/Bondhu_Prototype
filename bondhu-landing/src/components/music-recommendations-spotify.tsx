"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Music,
    RefreshCw,
    ThumbsUp,
    ThumbsDown,
    ExternalLink,
    Disc,
    TrendingUp,
    User,
    Crown,
    Headphones,
    Play,
    Link as LinkIcon,
    Loader2,
    CheckCircle,
    XCircle
} from "lucide-react"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"

interface SpotifyStatus {
    connected: boolean
    spotify_user_id?: string
    display_name?: string
    last_synced_at?: string
    error?: string
}

interface GenreRanking {
    [genre: string]: {
        percentage: number
        track_count: number
    }
}

interface TopSong {
    spotify_track_id: string
    track_name: string
    artists: string[]
    album_name: string
    popularity: number
    played_at: string
}

interface TopArtist {
    name: string
    play_count: number
}

interface MusicProfile {
    connected: boolean
    spotify_user_id?: string
    display_name?: string
    last_synced_at?: string
    genre_rankings: GenreRanking
    top_songs: TopSong[]
    top_artists: TopArtist[]
    stats: {
        total_tracks_synced: number
        genres_discovered: number
    }
    error?: string
}

interface Recommendation {
    id: string
    name: string
    artists: string[]
    album: string
    album_image?: string
    external_url: string
    preview_url?: string
    genz_genre: string
    personality_match?: number
}

interface WeightedRecommendations {
    success: boolean
    recommendations: { [genre: string]: Recommendation[] }
    genre_rankings: { [genre: string]: number }
    weighted_genres: { genre: string; weight: number }[]
    top_songs: TopSong[]
    top_artists: TopArtist[]
    personality_profile: { [trait: string]: number }
    error?: string
}

// Genre colors for visual flair
const genreColors: { [key: string]: string } = {
    "Lo-fi Chill": "from-cyan-500 to-blue-500",
    "Pop Anthems": "from-pink-500 to-purple-500",
    "Hype Beats": "from-orange-500 to-red-500",
    "Indie Vibes": "from-green-500 to-teal-500",
    "R&B Feels": "from-violet-500 to-fuchsia-500",
    "Sad Boy Hours": "from-slate-500 to-gray-600"
}

const genreEmojis: { [key: string]: string } = {
    "Lo-fi Chill": "🎧",
    "Pop Anthems": "🎤",
    "Hype Beats": "🔥",
    "Indie Vibes": "🌿",
    "R&B Feels": "💜",
    "Sad Boy Hours": "🌧️"
}

export default function MusicRecommendationsSpotify() {
    const [userId, setUserId] = useState<string | null>(null)
    const [status, setStatus] = useState<SpotifyStatus>({ connected: false })
    const [profile, setProfile] = useState<MusicProfile | null>(null)
    const [recommendations, setRecommendations] = useState<WeightedRecommendations | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSyncing, setIsSyncing] = useState(false)
    const [isConnecting, setIsConnecting] = useState(false)
    const [isLoadingRecs, setIsLoadingRecs] = useState(false)
    const [activeGenre, setActiveGenre] = useState<string | null>(null)

    const supabase = createClient()

    // Use same API URL resolution logic as chat.ts
    const API_BASE = (() => {
        if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
        if (process.env.NEXT_PUBLIC_BONDHU_API_URL) return process.env.NEXT_PUBLIC_BONDHU_API_URL;
        if (typeof window !== 'undefined') {
            // Derive origin from current host and assume API on port 8000
            return `${window.location.protocol}//${window.location.hostname}:8000`;
        }
        return 'http://localhost:8000';
    })();

    // Get current user
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserId(user.id)
            }
            setIsLoading(false)
        }
        getUser()
    }, [supabase])

    // Check Spotify connection status
    const checkStatus = useCallback(async () => {
        if (!userId) return

        try {
            const response = await fetch(`${API_BASE}/music/spotify/status/${userId}`)
            if (response.ok) {
                const data = await response.json()
                setStatus(data)

                if (data.connected) {
                    // If connected, load profile
                    await loadProfile()
                }
            }
        } catch (error) {
            console.error("Error checking Spotify status:", error)
        }
    }, [userId, API_BASE])

    // Load music profile
    const loadProfile = useCallback(async () => {
        if (!userId) return

        try {
            const response = await fetch(`${API_BASE}/music/spotify/profile/${userId}`)
            if (response.ok) {
                const data = await response.json()
                setProfile(data)
            }
        } catch (error) {
            console.error("Error loading profile:", error)
        }
    }, [userId, API_BASE])

    // Check status when userId changes
    useEffect(() => {
        if (userId) {
            checkStatus()
        }
    }, [userId, checkStatus])

    // Auto-load recommendations when userId available (refresh=true for fresh songs each page load)
    useEffect(() => {
        if (userId && !isLoadingRecs) {
            // Always load fresh recommendations on mount/userId change
            loadRecommendations(true)
        }
    }, [userId]) // Only depend on userId, not recommendations state


    // Connect to Spotify
    const connectSpotify = async () => {
        console.log("Connect Spotify clicked. UserID:", userId, "API_BASE:", API_BASE)
        if (!userId) {
            alert("Error: No User ID found. Are you logged in?")
            return
        }

        setIsConnecting(true)
        try {
            const url = `${API_BASE}/music/spotify/auth-url?user_id=${userId}`
            console.log("Fetching auth URL from:", url)

            const response = await fetch(url)
            console.log("Response status:", response.status)

            if (response.ok) {
                const data = await response.json()
                console.log("Response data:", data)
                if (data.auth_url) {
                    console.log("Redirecting to:", data.auth_url)
                    window.location.href = data.auth_url
                } else {
                    alert("Error: Backend returned no auth_url")
                }
            } else {
                const errorText = await response.text()
                console.error("Backend error:", errorText)
                alert(`Error: Backend returned ${response.status}\n${errorText.slice(0, 100)}`)
                toast.error("Failed to get Spotify auth URL")
            }
        } catch (error) {
            console.error("Error connecting to Spotify:", error)
            const errMsg = error instanceof Error ? error.message : String(error)
            alert(`Network Error: ${errMsg}`)
            toast.error("Failed to connect to Spotify")
        } finally {
            setIsConnecting(false)

        }
    }

    // Sync listening history
    const syncHistory = async () => {
        if (!userId) return

        setIsSyncing(true)
        try {
            const response = await fetch(`${API_BASE}/music/spotify/sync/${userId}?limit=30`, {
                method: 'POST'
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    toast.success(`Synced ${data.tracks_synced} tracks from Spotify!`)
                    await loadProfile()
                } else {
                    toast.error(data.error || "Sync failed")
                }
            } else {
                const error = await response.json()
                toast.error(error.detail || "Sync failed")
            }
        } catch (error) {
            console.error("Error syncing:", error)
            toast.error("Failed to sync history")
        } finally {
            setIsSyncing(false)
        }
    }

    // Load recommendations
    const loadRecommendations = async (refresh: boolean = false) => {
        if (!userId) return

        setIsLoadingRecs(true)
        try {
            const response = await fetch(
                `${API_BASE}/music/spotify/recommendations/${userId}?songs_per_genre=3&refresh=${refresh}`
            )

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    setRecommendations(data)
                    // Set active genre to top weighted genre
                    if (data.weighted_genres?.length > 0) {
                        setActiveGenre(data.weighted_genres[0].genre)
                    }
                } else {
                    toast.error(data.error || "Failed to load recommendations")
                }
            } else {
                const error = await response.json()
                toast.error(error.detail || "Failed to load recommendations")
            }
        } catch (error) {
            console.error("Error loading recommendations:", error)
            toast.error("Failed to load recommendations")
        } finally {
            setIsLoadingRecs(false)
        }
    }

    // Submit feedback
    const submitFeedback = async (track: Recommendation, feedbackType: 'like' | 'dislike') => {
        if (!userId) return

        try {
            const params = new URLSearchParams({
                user_id: userId,
                track_id: track.id,
                track_name: track.name,
                genz_genre: track.genz_genre,
                feedback_type: feedbackType
            })

            const response = await fetch(`${API_BASE}/music/spotify/feedback?${params}`, {
                method: 'POST'
            })

            if (response.ok) {
                toast.success(feedbackType === 'like' ? '👍 Added to favorites!' : '👎 Noted, we\'ll adjust')
            }
        } catch (error) {
            console.error("Error submitting feedback:", error)
        }
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-500" />
                    <p className="text-muted-foreground mt-4">Loading music recommendations...</p>
                </CardContent>
            </Card>
        )
    }

    // Not connected state - show connect option AND personality-based recommendations
    if (!status.connected) {
        return (
            <div className="space-y-6">
                {/* Connect Card */}
                <Card className="overflow-hidden">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-6 text-white">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-white/20 rounded-full">
                                <Music className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Connect Spotify</h3>
                                <p className="text-white/80 text-sm">Get even more personalized recommendations</p>
                            </div>
                        </div>
                    </div>
                    <CardContent className="p-4">
                        <Button
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={connectSpotify}
                            disabled={isConnecting}
                        >
                            {isConnecting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                <>
                                    <LinkIcon className="h-4 w-4 mr-2" />
                                    Connect with Spotify
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Personality-Based Recommendations (even without Spotify) */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Disc className="h-5 w-5 text-purple-500" />
                                <CardTitle>Music For Your Personality</CardTitle>
                            </div>
                            {!isLoadingRecs && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => loadRecommendations(true)}
                                    className="h-8 w-8"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Based on your personality profile • Connect Spotify for history-based recommendations
                        </p>
                    </CardHeader>

                    <CardContent>
                        {isLoadingRecs ? (
                            <div className="text-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-500" />
                                <p className="text-muted-foreground mt-2">Finding songs for you...</p>
                            </div>
                        ) : recommendations ? (
                            <div className="space-y-4">
                                {/* Genre Tabs */}
                                <div className="flex flex-wrap gap-2 pb-2 border-b">
                                    {recommendations.weighted_genres?.map(({ genre, weight }) => (
                                        <Button
                                            key={genre}
                                            variant={activeGenre === genre ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setActiveGenre(genre)}
                                            className={activeGenre === genre
                                                ? `bg-gradient-to-r ${genreColors[genre] || 'from-gray-500 to-slate-500'} text-white`
                                                : ''
                                            }
                                        >
                                            {genreEmojis[genre]} {genre}
                                        </Button>
                                    ))}
                                </div>

                                {/* Recommendations for Active Genre */}
                                {activeGenre && recommendations.recommendations[activeGenre] && (
                                    <div className="space-y-3">
                                        {recommendations.recommendations[activeGenre].map((track) => (
                                            <div
                                                key={track.id}
                                                className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                            >
                                                {track.album_image && (
                                                    <img
                                                        src={track.album_image}
                                                        alt={track.album}
                                                        className="w-12 h-12 rounded-md object-cover"
                                                    />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{track.name}</p>
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {track.artists?.join(', ')} • {track.album}
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => submitFeedback(track, 'like')}
                                                        className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                                                    >
                                                        <ThumbsUp className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => submitFeedback(track, 'dislike')}
                                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                                    >
                                                        <ThumbsDown className="h-4 w-4" />
                                                    </Button>
                                                    <a
                                                        href={track.external_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-green-500 hover:text-green-600"
                                                        >
                                                            <Play className="h-4 w-4" />
                                                        </Button>
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Button onClick={() => loadRecommendations(false)}>
                                    <Music className="h-4 w-4 mr-2" />
                                    Load Recommendations
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Connected state
    return (
        <div className="space-y-6">
            {/* Connection Status Card */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-500/10 rounded-full">
                                <Disc className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">
                                    Connected as {status.display_name || status.spotify_user_id}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Last synced: {profile?.last_synced_at
                                        ? new Date(profile.last_synced_at).toLocaleString()
                                        : 'Never'}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={syncHistory}
                            disabled={isSyncing}
                        >
                            {isSyncing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    Syncing...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-1" />
                                    Sync
                                </>
                            )}
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {/* Stats Overview */}
            {profile && (
                <Card>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                                <Music className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                                <p className="text-2xl font-bold text-purple-600">{profile.stats?.total_tracks_synced || 0}</p>
                                <p className="text-xs text-muted-foreground">Tracks Synced</p>
                            </div>
                            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                                <TrendingUp className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                                <p className="text-2xl font-bold text-blue-600">{profile.stats?.genres_discovered || 0}</p>
                                <p className="text-xs text-muted-foreground">Genres</p>
                            </div>
                            <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                                <Headphones className="h-5 w-5 mx-auto mb-1 text-green-500" />
                                <p className="text-2xl font-bold text-green-600">{profile.top_songs?.length || 0}</p>
                                <p className="text-xs text-muted-foreground">Top Songs</p>
                            </div>
                            <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                                <User className="h-5 w-5 mx-auto mb-1 text-orange-500" />
                                <p className="text-2xl font-bold text-orange-600">{profile.top_artists?.length || 0}</p>
                                <p className="text-xs text-muted-foreground">Top Artists</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Genre Rankings */}
            {profile?.genre_rankings && Object.keys(profile.genre_rankings).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Crown className="h-5 w-5 text-yellow-500" />
                            <span>Your Genre Vibes</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {Object.entries(profile.genre_rankings)
                            .sort(([, a], [, b]) => (b.percentage || 0) - (a.percentage || 0))
                            .map(([genre, data]) => (
                                <div key={genre} className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">
                                            {genreEmojis[genre] || '🎵'} {genre}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {data.percentage?.toFixed(1) || 0}%
                                        </span>
                                    </div>
                                    <Progress
                                        value={data.percentage || 0}
                                        className="h-2"
                                    />
                                </div>
                            ))}
                    </CardContent>
                </Card>
            )}

            {/* Top Songs */}
            {profile?.top_songs && profile.top_songs.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Music className="h-5 w-5 text-purple-500" />
                            <span>Top 10 Songs</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {profile.top_songs.slice(0, 10).map((song, index) => (
                                <div
                                    key={song.spotify_track_id}
                                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <span className="text-lg font-bold text-muted-foreground w-6">
                                        {index + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{song.track_name}</p>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {song.artists?.join(', ')}
                                        </p>
                                    </div>
                                    <a
                                        href={`https://open.spotify.com/track/${song.spotify_track_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-green-500 hover:text-green-600"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Top Artists */}
            {profile?.top_artists && profile.top_artists.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <User className="h-5 w-5 text-orange-500" />
                            <span>Top 5 Artists</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {profile.top_artists.slice(0, 5).map((artist, index) => (
                                <div
                                    key={artist.name}
                                    className="text-center p-3 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30"
                                >
                                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                        {index + 1}
                                    </div>
                                    <p className="font-medium text-sm truncate">{artist.name}</p>
                                    <p className="text-xs text-muted-foreground">{artist.play_count} plays</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Recommendations Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                            <Headphones className="h-5 w-5 text-blue-500" />
                            <span>Personalized Recommendations</span>
                        </CardTitle>
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => loadRecommendations(false)}
                                disabled={isLoadingRecs}
                            >
                                {isLoadingRecs ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    'Load Recommendations'
                                )}
                            </Button>
                            {recommendations && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => loadRecommendations(true)}
                                    disabled={isLoadingRecs}
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Based on your personality + listening history
                    </p>
                </CardHeader>

                {recommendations && (
                    <CardContent className="space-y-4">
                        {/* Personality Profile Summary */}
                        {recommendations.personality_profile && (
                            <div className="p-3 bg-muted/30 rounded-lg mb-4">
                                <p className="text-xs font-medium text-muted-foreground mb-2">Your Music Personality</p>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(recommendations.personality_profile)
                                        .sort(([, a], [, b]) => b - a)
                                        .slice(0, 3)
                                        .map(([trait, score]) => (
                                            <Badge key={trait} variant="secondary">
                                                {trait}: {score.toFixed(0)}
                                            </Badge>
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* Genre Tabs */}
                        <div className="flex flex-wrap gap-2 pb-2 border-b">
                            {recommendations.weighted_genres?.map(({ genre, weight }) => (
                                <Button
                                    key={genre}
                                    variant={activeGenre === genre ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setActiveGenre(genre)}
                                    className={activeGenre === genre
                                        ? `bg-gradient-to-r ${genreColors[genre] || 'from-gray-500 to-slate-500'} text-white`
                                        : ''
                                    }
                                >
                                    {genreEmojis[genre]} {genre}
                                </Button>
                            ))}
                        </div>

                        {/* Recommendations for Active Genre */}
                        {activeGenre && recommendations.recommendations[activeGenre] && (
                            <div className="space-y-3">
                                {recommendations.recommendations[activeGenre].map((track) => (
                                    <div
                                        key={track.id}
                                        className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                    >
                                        {/* Album Art */}
                                        {track.album_image && (
                                            <img
                                                src={track.album_image}
                                                alt={track.album}
                                                className="w-12 h-12 rounded-md object-cover"
                                            />
                                        )}

                                        {/* Track Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{track.name}</p>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {track.artists?.join(', ')} • {track.album}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center space-x-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => submitFeedback(track, 'like')}
                                                className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                                            >
                                                <ThumbsUp className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => submitFeedback(track, 'dislike')}
                                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                            >
                                                <ThumbsDown className="h-4 w-4" />
                                            </Button>
                                            <a
                                                href={track.external_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-green-500 hover:text-green-600"
                                                >
                                                    <Play className="h-4 w-4" />
                                                </Button>
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                )}
            </Card>
        </div>
    )
}
