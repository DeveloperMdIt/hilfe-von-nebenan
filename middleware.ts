import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Add custom headers to allow the Root Layout (Server Component)
    // to identify the current route and URL reliably.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-pathname', request.nextUrl.pathname);
    requestHeaders.set('x-url', request.url);

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

// Ensure middleware runs for all routes, but exclude static assets
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public (public items)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|hero.png).*)',
    ],
};
