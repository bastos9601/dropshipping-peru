import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Cache del access token (compartido con ml-auth-search)
let cachedToken: { token: string; expires: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  if (cachedToken && cachedToken.expires > Date.now()) {
    return cachedToken.token;
  }

  const appId = process.env.ML_APP_ID;
  const clientSecret = process.env.ML_CLIENT_SECRET;

  if (!appId || !clientSecret) {
    return null;
  }

  try {
    const response = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: appId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    cachedToken = {
      token: data.access_token,
      expires: Date.now() + (5 * 60 * 60 * 1000),
    };

    return data.access_token;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const itemId = searchParams.get('id');

  console.log('[ML-AUTH-ITEM] Item:', itemId);

  if (!itemId) {
    return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
  }

  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return NextResponse.json({ 
        error: 'No se pudo obtener access token' 
      }, { status: 500 });
    }

    const itemResponse = await fetch(`https://api.mercadolibre.com/items/${itemId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    console.log('[ML-AUTH-ITEM] Status:', itemResponse.status);

    if (!itemResponse.ok) {
      const errorText = await itemResponse.text();
      console.error('[ML-AUTH-ITEM] Error:', errorText);
      return NextResponse.json({ 
        error: 'ML API error',
        details: errorText 
      }, { status: itemResponse.status });
    }

    const item = await itemResponse.json();
    console.log('[ML-AUTH-ITEM] Item obtenido:', item.title);

    // Intentar obtener descripción
    let description = '';
    try {
      const descResponse = await fetch(`https://api.mercadolibre.com/items/${itemId}/description`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });

      if (descResponse.ok) {
        const descData = await descResponse.json();
        description = descData.plain_text || '';
      }
    } catch (e) {
      console.log('[ML-AUTH-ITEM] Sin descripción');
    }

    return NextResponse.json({
      ...item,
      description: description || item.description || '',
    });
  } catch (error: any) {
    console.error('[ML-AUTH-ITEM] Exception:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch item',
      message: error.message 
    }, { status: 500 });
  }
}
