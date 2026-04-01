import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const nextRaw = searchParams.get('next') ?? '/app';
  // Prevent open redirect: only allow relative paths starting with /
  const next = nextRaw.startsWith('/') && !nextRaw.startsWith('//') ? nextRaw : '/app';

  const supabase = await createServerClient();

  // Handle OAuth code exchange (Google, etc.)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Handle magic link / email OTP token verification
  if (token_hash && type) {
    const validTypes = ['email', 'magiclink'] as const;
    const otpType = validTypes.includes(type as typeof validTypes[number])
      ? (type as 'email' | 'magiclink')
      : 'magiclink';
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: otpType,
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth error — redirect to login with error
  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
