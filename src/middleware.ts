import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/server/auth/sessionToken';

const PUBLIC_PAGES = new Set(['/', '/login']);
const PUBLIC_API_PREFIXES = ['/api/auth/login', '/api/public/site'];

function isPublicPage(pathname: string) {
  return PUBLIC_PAGES.has(pathname);
}

function isPublicApi(pathname: string) {
  return PUBLIC_API_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** The cron route checks CRON_SECRET itself. It has no session cookie. */
function isCronApi(pathname: string) {
  return pathname === '/api/cron/fees';
}

function isStaticAsset(pathname: string) {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/lottie') ||
    pathname.startsWith('/modal') ||
    pathname.startsWith('/brand') ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|css|js|map)$/.test(pathname)
  );
}

async function hasValidSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return Boolean(await verifySessionToken(token));
}

export async function middleware(request: NextRequest) {
  if (process.env.E2E_BYPASS_AUTH === '1') {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  if (
    isStaticAsset(pathname) ||
    isPublicPage(pathname) ||
    isPublicApi(pathname) ||
    isCronApi(pathname)
  ) {
    return NextResponse.next();
  }

  if (await hasValidSession(request)) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { message: 'La sesión no es válida.' },
      { status: 401 },
    );
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/login';
  loginUrl.search = '';
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
