import { forward } from '../../../_utils/proxy';

export async function POST(request, { params }) {
  const { orderId } = await params;
  const body = await request.text();
  return forward(request, `/orders/${orderId}/schedule`, { method: 'POST', body });
}