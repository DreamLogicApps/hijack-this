import { NextResponse } from 'next/server';
import { supabase, getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { newUrl, newLabel, newName, customPrice } = await req.json();

    // 1. Fetch current price from Supabase
    const { data: currentLink, error } = await supabase
      .from('current_link')
      .select('hijack_price, id')
      .limit(1)
      .single();

    if (error || !currentLink) {
      console.error('Error fetching current link:', error);
      return NextResponse.json({ error: 'Failed to fetch current price' }, { status: 500 });
    }

    // Minimum price required is current_price + 10%
    const minRequiredPrice = Number((currentLink.hijack_price * 1.10).toFixed(2));
    
    // NSFW & Malicious URL filter
    const bannedKeywords = ['nsfw', 'porn', 'xxx', 'sex', 'casino', 'gamble', 'betting', 'scam', 'phishing', 'malware'];
    const lowerUrl = newUrl.toLowerCase();
    const lowerLabel = newLabel.toLowerCase();
    const lowerName = newName.toLowerCase();
    
    if (bannedKeywords.some(kw => lowerUrl.includes(kw) || lowerLabel.includes(kw) || lowerName.includes(kw))) {
      return NextResponse.json({ error: 'NSFW or restricted content is not allowed.' }, { status: 400 });
    }

    // User can bid customPrice if higher or equal to minRequiredPrice
    let finalPrice = customPrice && Number(customPrice) >= minRequiredPrice
      ? Number(Number(customPrice).toFixed(2))
      : minRequiredPrice;

    // Minimum gateway threshold ($0.50 USD / 50 cents)
    if (finalPrice < 0.50) {
      finalPrice = 0.50;
    }

    const priceInCents = Math.round(finalPrice * 100);

    const dodoApiKey = process.env.DODO_PAYMENTS_API_KEY?.trim();
    const dodoProductId = process.env.DODO_PAYMENTS_PRODUCT_ID?.trim();
    const lsApiKey = process.env.LEMONSQUEEZY_API_KEY?.trim();
    const lsStoreId = process.env.LEMONSQUEEZY_STORE_ID?.trim();
    const lsVariantId = process.env.LEMONSQUEEZY_VARIANT_ID?.trim();
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // 1. DODO PAYMENTS CHECKOUT
    if (dodoApiKey && dodoProductId) {
      const mode = process.env.DODO_PAYMENTS_MODE === 'test' ? 'test' : 'live';
      const dodoEndpoint = `https://${mode}.dodopayments.com/payments`;

      console.log(`[Dodo Payments] Creating ${mode} checkout session for $${finalPrice}...`);

      const response = await fetch(dodoEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${dodoApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: {
            name: newName || 'Anonymous Hijacker',
            email: 'hijacker@hijackthis.site',
          },
          billing: { country: 'US' },
          payment_link: true,
          total_amount: priceInCents,
          product_cart: [
            {
              product_id: dodoProductId,
              name: `Hijack Link - ${newLabel}`,
              amount: priceInCents,
              unit_price: priceInCents,
              price: priceInCents,
              custom_amount: priceInCents,
              quantity: 1,
            },
          ],
          metadata: {
            newUrl,
            newLabel,
            newName,
            newPrice: finalPrice.toString(),
            linkId: currentLink.id,
          },
          return_url: `${origin}/?success=true&newUrl=${encodeURIComponent(newUrl)}&newLabel=${encodeURIComponent(newLabel)}&newName=${encodeURIComponent(newName)}&newPrice=${finalPrice}&linkId=${currentLink.id}`,
        }),
      });

      const dodoData = await response.json();

      if (!response.ok) {
        console.error('Dodo Payments Checkout Error details:', JSON.stringify(dodoData));
        const errMsg = dodoData.message || dodoData.error || dodoData.detail || (Array.isArray(dodoData.errors) ? dodoData.errors[0]?.detail : '') || 'Failed to create Dodo Payments checkout';
        return NextResponse.json({ error: errMsg }, { status: 400 });
      }

      const checkoutUrl = dodoData.payment_link || (dodoData.payment_id ? `https://${mode}.dodopayments.com/buy/${dodoData.payment_id}` : null);
      if (!checkoutUrl) {
        console.error('Dodo Payments Checkout returned no URL. Full response:', JSON.stringify(dodoData));
        return NextResponse.json({ error: `Dodo Payments response: ${JSON.stringify(dodoData)}` }, { status: 500 });
      }

      return NextResponse.json({ url: checkoutUrl });
    }

    // 2. LEMON SQUEEZY CHECKOUT
    if (lsApiKey && lsStoreId && lsVariantId) {
      const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
          'Authorization': `Bearer ${lsApiKey}`,
        },
        body: JSON.stringify({
          data: {
            type: 'checkouts',
            attributes: {
              custom_price: priceInCents,
              product_options: {
                name: 'Hijack the Link',
                description: `Set central link to: "${newLabel}"`,
                redirect_url: `${origin}/?success=true`,
              },
              checkout_data: {
                custom: {
                  newUrl,
                  newLabel,
                  newName,
                  newPrice: finalPrice.toString(),
                  linkId: currentLink.id,
                },
              },
            },
            relationships: {
              store: {
                data: {
                  type: 'stores',
                  id: lsStoreId.toString(),
                },
              },
              variant: {
                data: {
                  type: 'variants',
                  id: lsVariantId.toString(),
                },
              },
            },
          },
        }),
      });

      const checkoutData = await response.json();

      if (!response.ok) {
        console.error('Lemon Squeezy Checkout Error:', checkoutData);
        throw new Error(checkoutData.errors?.[0]?.detail || 'Failed to create Lemon Squeezy checkout');
      }

      return NextResponse.json({ url: checkoutData.data.attributes.url });
    }

    // 3. FALLBACK: MOCK PAYMENT MODE
    console.log(`[Mock Mode] Executing hijack for $${finalPrice}`);

    const supabaseAdmin = getSupabaseAdmin();
    
    // Update current_link
    const { error: updateErr } = await supabaseAdmin
      .from('current_link')
      .update({
        url: newUrl,
        label: newLabel,
        owner_name: newName,
        hijack_price: finalPrice,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentLink.id);

    if (updateErr) {
      console.error('Mock update error:', updateErr);
      return NextResponse.json({ error: 'Failed to update database in mock mode' }, { status: 500 });
    }

    // Log to hijack_history
    await supabaseAdmin
      .from('hijack_history')
      .insert({
        url: newUrl,
        label: newLabel,
        owner_name: newName,
        price_paid: finalPrice,
        created_at: new Date().toISOString(),
      });

    return NextResponse.json({
      url: '/?success=true&mock=true',
      isMock: true,
      message: 'Hijacked in Mock Mode!',
    });
  } catch (err: unknown) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
