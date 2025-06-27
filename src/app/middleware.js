// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // List of auth pages that don't require token
  const authPages = ['/login', '/signup', '/forgot-password'];

  // If trying to access protected page without token
  if (!token && !authPages.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If trying to access auth page with token
  if (token && authPages.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}