import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This route handler receives webhook notifications from payment gateway
// POST /api/payment-webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify webhook secret (customize for your payment gateway)
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;
    const signature = request.headers.get('x-webhook-signature');

    if (webhookSecret && signature !== webhookSecret) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const { status, user_id } = body;

    // Check for successful payment status
    if (status === 'PAID' || status === 'SUCCESS') {
      // Use service role key for admin operations
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );

      const { error } = await supabaseAdmin
        .from('users')
        .update({ status_langganan: 'premium' })
        .eq('id', user_id);

      if (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
      }

      return NextResponse.json({ message: 'User upgraded to premium' });
    }

    return NextResponse.json({ message: 'Status not actionable' });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
