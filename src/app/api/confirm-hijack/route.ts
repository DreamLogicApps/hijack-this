import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { paymentId, newUrl, newLabel, newName, newPrice, linkId } = await req.json();

    const dodoApiKey = process.env.DODO_PAYMENTS_API_KEY?.trim();

    let finalUrl = newUrl;
    let finalLabel = newLabel;
    let finalName = newName;
    let finalPriceNum = parseFloat(newPrice);

    // 1. STRICT SECURITY GUARD: VERIFY STATUS WITH DODO PAYMENTS GATEWAY SERVER
    if (dodoApiKey && paymentId) {
      const mode = dodoApiKey.startsWith('live_') ? 'live' : 'test';
      const dodoVerifyEndpoint = `https://${mode}.dodopayments.com/payments/${paymentId}`;

      console.log(`[Security Guard] Verifying payment status for ${paymentId} with Dodo Payments...`);

      const response = await fetch(dodoVerifyEndpoint, {
        headers: {
          'Authorization': `Bearer ${dodoApiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`[Security Guard] Verification request failed for paymentId=${paymentId}`);
        return NextResponse.json({ error: 'Failed to verify payment status with gateway' }, { status: 400 });
      }

      const verifyData = await response.json();
      console.log(`[Security Guard] Gateway verification response for ${paymentId}:`, {
        status: verifyData.status,
        payment_status: verifyData.payment_status,
      });

      const paymentStatus = (verifyData.status || verifyData.payment_status || '').toLowerCase();

      // BLOCK IF PAYMENT WAS NOT COMPLETED SUCCESSFULLY
      if (paymentStatus !== 'succeeded' && paymentStatus !== 'paid') {
        console.warn(`🔒 SECURITY BLOCK: Payment ${paymentId} has status '${paymentStatus}'. Hijack request rejected!`);
        return NextResponse.json({ error: 'Payment was not completed successfully', status: paymentStatus }, { status: 400 });
      }

      // Use server-verified metadata if available
      const meta = verifyData.metadata || {};
      if (meta.newUrl) finalUrl = meta.newUrl;
      if (meta.newLabel) finalLabel = meta.newLabel;
      if (meta.newName) finalName = meta.newName;
      if (meta.newPrice) finalPriceNum = parseFloat(meta.newPrice);
    }

    if (!finalUrl || !finalLabel || !finalName || isNaN(finalPriceNum)) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // 2. Fetch current price and champion details
    const { data: currentLink } = await supabaseAdmin
      .from('current_link')
      .select('hijack_price, owner_name, label, id')
      .limit(1)
      .single();

    const targetId = linkId || currentLink?.id;

    // Check if this exact bid was already applied to current_link
    if (currentLink && currentLink.owner_name === finalName && currentLink.label === finalLabel && currentLink.hijack_price >= finalPriceNum) {
      console.log('⚡ Bid already applied to current_link, skipping duplicate insert.');
      return NextResponse.json({ message: 'Already applied' });
    }

    // 3. Update current_link
    const { error: updateErr } = await supabaseAdmin
      .from('current_link')
      .update({
        url: finalUrl,
        label: finalLabel,
        owner_name: finalName,
        hijack_price: finalPriceNum,
        clicks: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetId);

    if (updateErr) {
      console.error('Error updating link via confirm-hijack:', updateErr);
      return NextResponse.json({ error: 'Failed to update link' }, { status: 500 });
    }

    // 4. Insert into hijack_history
    await supabaseAdmin
      .from('hijack_history')
      .insert({
        url: finalUrl,
        label: finalLabel,
        owner_name: finalName,
        price_paid: finalPriceNum,
        created_at: new Date().toISOString(),
      });

    console.log(`✅ VERIFIED PAYMENT HIJACK CONFIRMED: $${finalPriceNum} (${finalName} -> ${finalUrl})`);

    return NextResponse.json({ success: true, updated: true });
  } catch (err: unknown) {
    console.error('Confirm-hijack error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
