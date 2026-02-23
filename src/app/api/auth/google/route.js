import { forward } from '../../_utils/proxy';

export async function GET(request) {
  // Pass query params to backend
  const url = new URL(request.url);
  const search = url.search || '';
  return forward(request, `/auth/google${search}`, { method: 'GET' });
}
