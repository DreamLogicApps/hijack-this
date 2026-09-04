import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

export async function GET() {
  return NextResponse.json({ status: 'active', service: 'Dodo Payments Webhook Handler' });
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;

    if (webhookSecret) {
      const signature = req.headers.get('x-dodo-signature') || req.headers.get('webhook-signature') || req.headers.get('signature');
      if (signature) {
        const hmac = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
        if (hmac !== signature && !signature.includes(hmac)) {
          console.warn('Dodo Payments Webhook signature check:', { hmac, signature });
        }
      }
    }

    const payload = JSON.parse(rawBody);
    console.log('Dodo Payments Webhook Received:', JSON.stringify(payload));

    const metadata = 
      payload.data?.metadata || 
      payload.metadata || 
      payload.data?.payment?.metadata || 
      payload.payment?.metadata || 
      {};

    const { newUrl, newLabel, newName, newPrice, linkId, trashTalk, slotType = 'main' } = metadata;

    if (!newUrl || !newLabel || !newName || !newPrice) {
      console.error('Metadata missing or invalid in Dodo Payments webhook payload:', metadata);
      return NextResponse.json({ message: 'Webhook received but missing metadata' }, { status: 200 });
    }

    const finalPrice = parseFloat(newPrice);
    const supabaseAdmin = getSupabaseAdmin();

    // 1a. Check for recent duplicate in hijack_history (within last 60 seconds)
    const sixtySecsAgo = new Date(Date.now() - 60000).toISOString();
    const { data: existingHist } = await supabaseAdmin
      .from('hijack_history')
      .select('id')
      .eq('owner_name', newName)
      .eq('label', newLabel)
      .eq('slot_type', slotType)
      .gte('created_at', sixtySecsAgo)
      .limit(1);

    if (existingHist && existingHist.length > 0) {
      console.log('Duplicate Dodo webhook event ignored');
      return NextResponse.json({ message: 'Duplicate prevented' }, { status: 200 });
    }

    // 1. Fetch current link to update
    const { data: currentLink } = await supabaseAdmin
      .from('current_link')
      .select('hijack_price, owner_name, label, id')
      .eq('slot_type', slotType)
      .limit(1)
      .single();

    if (currentLink && currentLink.owner_name === newName && currentLink.label === newLabel && currentLink.hijack_price >= finalPrice) {
      console.log('⚡ Dodo Webhook: Bid already applied to current_link, skipping.');
      return NextResponse.json({ message: 'Already applied' }, { status: 200 });
    }

    const targetId = linkId || currentLink?.id;

    if (!targetId) {
      console.error('No target link ID found in database to update');
      return NextResponse.json({ error: 'No link ID found' }, { status: 400 });
    }

    // 2. Update current_link
    const { error: updateErr } = await supabaseAdmin
      .from('current_link')
      .update({
        url: newUrl,
        label: newLabel,
        owner_name: newName,
        hijack_price: finalPrice,
        clicks: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetId);

    if (updateErr) {
      console.error('Error updating current_link via Dodo Payments webhook:', updateErr);
      return NextResponse.json({ error: 'Failed to update link' }, { status: 500 });
    }

    // 3. Insert into hijack_history
    const { error: historyErr } = await supabaseAdmin
      .from('hijack_history')
      .insert({
        url: newUrl,
        label: newLabel,
        owner_name: newName,
        slot_type: slotType,
        price_paid: finalPrice,
        created_at: new Date().toISOString(),
      });

    if (historyErr) {
      console.error('Error inserting into hijack_history via Dodo Payments webhook:', historyErr);
    }

    console.log(`✅ Successfully updated HackRank via Dodo Payments for $${finalPrice} (${newName} -> ${newUrl})`);

    return NextResponse.json({ success: true, message: 'Updated link successfully' });
  } catch (err: unknown) {
    console.error('Webhook processing error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
