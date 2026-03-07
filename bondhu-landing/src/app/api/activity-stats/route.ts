import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user activity stats
    const { data: stats, error: statsError } = await supabase
      .from('user_activity_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (statsError) {
      console.error('Error fetching activity stats:', statsError);
      return NextResponse.json(
        { error: 'Failed to fetch activity stats' },
        { status: 500 }
      );
    }

    // Transform the data to match the component's expected format
    const transformedStats = {
      wellnessScore: stats?.wellness_score || 0,
      wellnessTrend: stats?.wellness_trend || 0,
      totalMessages: stats?.total_messages || 0,
      messagesToday: stats?.messages_today || 0,
      totalGamesPlayed: stats?.total_games_played || 0,
      gamesThisWeek: stats?.games_this_week || 0,
      currentStreakDays: stats?.current_streak_days || 0,
      longestStreakDays: stats?.longest_streak_days || 0,
      totalAchievements: stats?.total_achievements || 0,
      achievementsThisMonth: stats?.achievements_this_month || 0,
      activeSessions: stats?.active_sessions || 0,
      activeSessionsToday: stats?.active_sessions_today || 0,
      gamesPlayedCount: stats?.games_played_count || 0,
      videosWatchedCount: stats?.videos_watched_count || 0,
      songsListenedCount: stats?.songs_listened_count || 0,
      lastActivityDate: stats?.last_activity_date,
      updatedAt: stats?.updated_at,
    };

    return NextResponse.json(transformedStats);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST endpoint to update specific stats (can be called from chat, games, etc.)
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'increment_chat':
        await supabase.rpc('increment_chat_session', {
          user_id: user.id,
          message_count: data?.messageCount || 1
        });
        break;

      case 'increment_game':
        {
          const { error: rpcError } = await supabase.rpc('increment_game_played', {
            user_id: user.id,
            game_name: data?.gameName || null
          });
          
          if (rpcError) {
            // Fallback: direct update if RPC doesn't exist or fails
            console.log('RPC error or not available, using direct update for games:', rpcError.message);
            const { data: current } = await supabase
              .from('user_activity_stats')
              .select('games_played_count, total_games_played')
              .eq('user_id', user.id)
              .single();
            
            if (current) {
              await supabase
                .from('user_activity_stats')
                .update({
                  games_played_count: (current.games_played_count || 0) + 1,
                  total_games_played: (current.total_games_played || 0) + 1,
                  last_activity_date: new Date().toISOString()
                })
                .eq('user_id', user.id);
            } else {
              // Create the row if it doesn't exist
              await supabase
                .from('user_activity_stats')
                .insert({
                  user_id: user.id,
                  games_played_count: 1,
                  total_games_played: 1,
                  last_activity_date: new Date().toISOString()
                });
            }
          }
        }
        break;

      case 'increment_video':
        await supabase.rpc('increment_video_watched', {
          user_id: user.id
        });
        break;

      case 'increment_song':
        await supabase.rpc('increment_song_listened', {
          user_id: user.id
        });
        break;

      case 'update_wellness':
        await supabase.rpc('update_wellness_score', {
          user_id: user.id,
          new_score: data?.score,
          trend_change: data?.trend || 0
        });
        break;

      case 'update_streak':
        {
          const { error: rpcError } = await supabase.rpc('update_streak', {
            user_id: user.id
          });
          
          if (rpcError) {
            // Fallback: direct update if RPC doesn't exist
            console.log('RPC error or not available, using direct update for streak:', rpcError.message);
            const { data: current } = await supabase
              .from('user_activity_stats')
              .select('current_streak_days, last_activity_date')
              .eq('user_id', user.id)
              .single();
            
            if (current) {
              const lastActivity = current.last_activity_date ? new Date(current.last_activity_date) : null;
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              let newStreak = current.current_streak_days || 0;
              
              if (lastActivity) {
                lastActivity.setHours(0, 0, 0, 0);
                const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
                
                if (daysDiff === 0) {
                  // Same day, no change to streak
                } else if (daysDiff === 1) {
                  // Consecutive day, increment streak
                  newStreak += 1;
                } else {
                  // Streak broken, reset to 1
                  newStreak = 1;
                }
              } else {
                newStreak = 1;
              }
              
              await supabase
                .from('user_activity_stats')
                .update({
                  current_streak_days: newStreak,
                  last_activity_date: new Date().toISOString()
                })
                .eq('user_id', user.id);
            }
          }
        }
        break;

      case 'add_achievement':
        await supabase.rpc('add_achievement', {
          user_id: user.id,
          achievement_name: data?.name,
          achievement_description: data?.description || null
        });
        break;

      case 'update_active_sessions':
        await supabase.rpc('update_active_sessions', {
          user_id: user.id,
          session_types: data?.sessionTypes || []
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
