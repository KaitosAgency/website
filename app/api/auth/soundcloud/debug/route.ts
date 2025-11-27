import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.SOUNDCLOUD_CLIENT_ID;
  const redirectUri = process.env.SOUNDCLOUD_REDIRECT_URI || 'http://localhost:3000/api/auth/soundcloud/callback';
  const scope = 'non-expiring';

  if (!clientId) {
    return NextResponse.json(
      { error: 'SOUNDCLOUD_CLIENT_ID is not configured' },
      { status: 500 }
    );
  }

  // Générer un state pour la sécurité CSRF
  const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  const soundcloudUrl = `https://soundcloud.com/connect?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}`;

  return NextResponse.json({
    clientId,
    redirectUri,
    scope,
    state,
    soundcloudUrl,
    instructions: [
      '1. Copiez l\'URL soundcloudUrl ci-dessus',
      '2. Collez-la dans votre navigateur',
      '3. Autorisez l\'application SoundCloud',
      '4. Vous serez redirigé vers le callback',
      '5. Le callback vous redirigera vers /music/dashboard'
    ]
  });
}




