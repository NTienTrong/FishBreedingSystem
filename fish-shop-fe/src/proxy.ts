import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
        const tokenParts = token.split('.');
        if (tokenParts.length < 2) {
            return null;
        }

        const payload = tokenParts[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        const normalizedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
        const parsed = JSON.parse(atob(normalizedPayload));

        return parsed as Record<string, unknown>;
    } catch {
        return null;
    }
}

function redirectToLoginWithExpired(request: NextRequest) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('message', 'session_expired');
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('adminToken');
    response.cookies.delete('adminRole');
    return response;
}

export function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;

    const isAdminPath = path.startsWith('/admin') && !path.startsWith('/admin/login');

    const token = request.cookies.get('adminToken')?.value;
    const roleCookie = request.cookies.get('adminRole')?.value;

    if (isAdminPath && !token) {
        return redirectToLoginWithExpired(request);
    }

    if (isAdminPath && token) {
        const payload = decodeJwtPayload(token);
        const nowInSeconds = Math.floor(Date.now() / 1000);
        const tokenExp = typeof payload?.exp === 'number' ? payload.exp : 0;
        const tokenRole = typeof payload?.role === 'string' ? payload.role.toUpperCase() : '';
        const normalizedRoleCookie = (roleCookie ?? '').toUpperCase();

        if (!payload || tokenExp <= nowInSeconds || tokenRole !== 'ADMIN' || normalizedRoleCookie !== 'ADMIN') {
            return redirectToLoginWithExpired(request);
        }
    }

    if (path.startsWith('/admin/login') && token) {
        const payload = decodeJwtPayload(token);
        const nowInSeconds = Math.floor(Date.now() / 1000);
        const tokenExp = typeof payload?.exp === 'number' ? payload.exp : 0;
        const tokenRole = typeof payload?.role === 'string' ? payload.role.toUpperCase() : '';
        const normalizedRoleCookie = (roleCookie ?? '').toUpperCase();

        if (!payload || tokenExp <= nowInSeconds || tokenRole !== 'ADMIN' || normalizedRoleCookie !== 'ADMIN') {
            return redirectToLoginWithExpired(request);
        }

        return NextResponse.redirect(new URL('/admin', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
