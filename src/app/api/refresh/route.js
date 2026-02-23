import { forward } from '../_utils/proxy';

export async function POST(request) {
  return forward(request, '/refresh', { method: 'POST' });
}
