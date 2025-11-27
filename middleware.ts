import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Le middleware n'est plus nécessaire en local car on utilise directement /api/auth/soundcloud/callback
  return NextResponse.next();
}

export const config = {
  matcher: '/music',
};

