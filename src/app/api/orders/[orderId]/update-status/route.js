import { forward } from '../../../_utils/proxy';

export async function PATCH(request, { params }) {
  const { orderId } = params;
  const body = await request.text();
  return forward(request, `/orders/${orderId}/update-status`, { method: 'PATCH', body });
}
