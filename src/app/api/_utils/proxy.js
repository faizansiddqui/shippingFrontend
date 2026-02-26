import { NextResponse } from 'next/server';

const backendBase =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://shippingbackendfordeployment.onrender.com';

export async function forward(req, path, init = {}) {
  const requestHeaders = req.headers;
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

  const responseHeaders = new Headers();
  responseHeaders.set('content-type', res.headers.get('content-type') || 'application/json');

  // Pass through (and rewrite) Set-Cookie for sessions
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
    const host = requestHeaders.get('host') || '';
    const cookies = setCookie.split(/,(?=[^;]+=[^;]+)/); // split multiple set-cookies safely
    const rewritten = cookies.map((c) => {
      let v = c.replace(/Domain=[^;]+/i, host ? `Domain=${host}` : ''); // rewrite domain to current host
      if (host.includes('localhost')) {
        v = v.replace(/; *Secure/gi, ''); // allow http local dev
        v = v.replace(/SameSite=None/gi, 'SameSite=Lax'); // avoid rejection on http
      }
      return v;
    });
    // For multiple cookies, append rather than merge
    rewritten.forEach((cookie) => responseHeaders.append('set-cookie', cookie));
  }

  const response = new NextResponse(buffer, {
    status: res.status,
    headers: responseHeaders,
  });

  return response;
}
