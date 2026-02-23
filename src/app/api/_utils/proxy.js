import { NextResponse } from 'next/server';

const backendBase =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://shippingbackendfordeployment.onrender.com';

export async function forward(req, path, init = {}) {
  const url = `${backendBase}${path}`;
  const headers = new Headers(init.headers || {});

  // Forward incoming cookies to backend (for auth/httpOnly)
  const incomingCookies = req.headers.get('cookie');
  if (incomingCookies) headers.set('cookie', incomingCookies);

  // Ensure content-type stays if caller passed one
  if (!headers.has('content-type') && init.body) {
    headers.set('content-type', 'application/json');
  }

  const res = await fetch(url, {
    method: init.method || 'GET',
    headers,
    body: init.body,
    cache: 'no-store',
  });

  // Pass through body
  const buffer = await res.arrayBuffer();

  const response = new NextResponse(buffer, {
    status: res.status,
    headers: {
      'content-type': res.headers.get('content-type') || 'application/json',
    },
  });

  // Pass through Set-Cookie for sessions
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) response.headers.set('set-cookie', setCookie);

  return response;
}
