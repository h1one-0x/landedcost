import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient as createSSRServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createSSRServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options as Record<string, unknown>);
        });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  // Protect /app/* routes — redirect to login if unauthenticated
  if (!user && request.nextUrl.pathname.startsWith('/app')) {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated user hits /auth/login, redirect to dashboard
  if (user && request.nextUrl.pathname === '/auth/login') {
    const appUrl = new URL('/app', request.url);
    return NextResponse.redirect(appUrl);
  }

  return response;
}

export const config = {
  matcher: ['/app/:path*', '/auth/login'],
};
