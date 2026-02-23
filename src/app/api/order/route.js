import { NextResponse } from 'next/server';

const backendBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://shippingbackendfordeployment.onrender.com';

export async function POST(request) {
  try {
    const payload = await request.json();
    const upstream = await fetch(`${backendBase}/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    console.error('Proxy /api/order failed:', error);
    return NextResponse.json({ error: 'order_proxy_failed', message: error.message }, { status: 500 });
  }
}
