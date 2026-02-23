import { forward } from '../_utils/proxy';

export async function POST(request) {
  const body = await request.text();
  return forward(request, '/create-razor', { method: 'POST', body });
}
