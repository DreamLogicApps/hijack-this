import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { type, id } = await req.json();

    if (!type || !id) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    let error;

    if (type === 'current') {
      const { error: rpcError } = await supabaseAdmin.rpc('increment_current_clicks', { row_id: id });
      error = rpcError;
    } else if (type === 'history') {
      const { error: rpcError } = await supabaseAdmin.rpc('increment_history_clicks', { row_id: id });
      error = rpcError;
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    if (error) {
      console.error('Error incrementing clicks:', error);
      return NextResponse.json({ error: 'Failed to increment clicks' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Track-click error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
