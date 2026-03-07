import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/crisis/acknowledge
 * Log user's acknowledgment of a crisis intervention
 */
// Crisis follow-up delay: 1 hour in milliseconds
const CRISIS_FOLLOWUP_DELAY_MS = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { confirmed, severity, timestamp, event_id } = body;

    // Log the acknowledgment
    if (event_id) {
      // Update existing crisis event
      const { error: updateError } = await supabase.rpc('update_crisis_response', {
        p_event_id: event_id,
        p_user_acknowledged: true,
        p_user_confirmed_safety: confirmed,
        p_resolution_notes: confirmed 
          ? 'User confirmed they are safe' 
          : 'User did not confirm safety - follow-up may be needed'
      });

      if (updateError) {
        console.error('Failed to update crisis response:', updateError);
        return NextResponse.json(
          { error: 'Failed to log acknowledgment' },
          { status: 500 }
        );
      }
    } else {
      // Log as a new acknowledgment record
      const { error: insertError } = await supabase
        .from('crisis_events')
        .insert({
          user_id: user.id,
          severity,
          user_acknowledged: true,
          user_confirmed_safety: confirmed,
          intervention_type: 'crisis_hotline',
          crisis_signals: { acknowledged_at: timestamp },
          resolution_notes: confirmed 
            ? 'User confirmed they are safe via modal' 
            : 'User dismissed modal without confirming safety',
        });

      if (insertError) {
        console.error('Failed to log crisis acknowledgment:', insertError);
        return NextResponse.json(
          { error: 'Failed to log acknowledgment' },
          { status: 500 }
        );
      }
    }

    // If user did NOT confirm safety and severity is high/critical,
    // schedule a follow-up check-in
    if (!confirmed && (severity === 'high' || severity === 'critical')) {
      const { error: checkinError } = await supabase.rpc('log_proactive_checkin', {
        p_user_id: user.id,
        p_trigger_reason: 'crisis_followup',
        p_message_type: 'followup',
        p_message_content: "Hey, I just wanted to check in with you. I'm here if you want to talk about anything. How are you feeling right now?",
        p_priority: 'high',
        p_scheduled_for: new Date(Date.now() + CRISIS_FOLLOWUP_DELAY_MS).toISOString(),
      });

      if (checkinError) {
        console.error('Failed to schedule follow-up check-in:', checkinError);
      }
    }

    return NextResponse.json({ 
      success: true,
      message: confirmed 
        ? "Thank you for letting me know you're safe. I'm always here if you need to talk."
        : "I understand. Remember, you can reach out anytime. I care about you."
    });

  } catch (error) {
    console.error('Crisis acknowledge error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
