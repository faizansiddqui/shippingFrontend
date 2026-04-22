import { forward } from '../../_utils/proxy';

export async function POST(request) {
  // backend exposes a top-level /refresh route
  return forward(request, '/refresh', { method: 'POST' });
}
