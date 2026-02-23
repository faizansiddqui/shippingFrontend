import { forward } from '../../_utils/proxy';

export async function GET(request) {
  return forward(request, '/wallet/balance', { method: 'GET' });
}
