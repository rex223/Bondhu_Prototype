import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/notifications
 * Fetch pending notifications for the authenticated user
 */
export async function GET(request: NextRequest) {
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

    // Get pending notifications using the RPC function
    const { data: notifications, error: fetchError } = await supabase.rpc(
      'get_pending_notifications',
      { p_user_id: user.id }
    );

    if (fetchError) {
      console.error('Failed to fetch notifications:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      );
    }

    // Transform notifications for frontend
    const formattedNotifications = (notifications || []).map((n: any) => ({
      id: n.id,
      type: n.notification_type,
      title: n.title,
      message: n.message,
      priority: n.priority,
      createdAt: n.created_at,
      metadata: n.metadata,
    }));

    return NextResponse.json({
      success: true,
      notifications: formattedNotifications,
    });

  } catch (error) {
    console.error('Notifications fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * Mark a notification as read
 */
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
    const { notification_id, action } = body;

    if (action === 'mark_read' && notification_id) {
      const { error: updateError } = await supabase.rpc('mark_notification_read', {
        p_notification_id: notification_id,
      });

      if (updateError) {
        console.error('Failed to mark notification as read:', updateError);
        return NextResponse.json(
          { error: 'Failed to update notification' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Notification update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
