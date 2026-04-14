import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  
  console.log('[ML-CALLBACK] Código recibido:', code);

  if (!code) {
    return NextResponse.json({ error: 'No code' }, { status: 400 });
  }

  try {
    const response = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.ML_CLIENT_ID,
        client_secret: process.env.ML_CLIENT_SECRET,
        code,
        redirect_uri: process.env.ML_REDIRECT_URI,
      }),
    });

    const data = await response.json();
    
    console.log('[ML-CALLBACK] 🔑 TOKEN OBTENIDO:', {
      access_token: data.access_token?.substring(0, 20) + '...',
      expires_in: data.expires_in,
      refresh_token: data.refresh_token ? 'Sí' : 'No'
    });

    // Redirigir a una página de éxito con el token
    const successUrl = `/admin/ml-success?token=${encodeURIComponent(data.access_token)}&refresh=${encodeURIComponent(data.refresh_token || '')}`;
    
    return NextResponse.redirect(new URL(successUrl, req.url));
  } catch (error: any) {
    console.error('[ML-CALLBACK] Error:', error);
    return NextResponse.json({ error: 'Error OAuth', details: error.message }, { status: 500 });
  }
}
