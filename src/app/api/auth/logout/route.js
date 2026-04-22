import { forward } from '../../_utils/proxy';

export async function POST(request) {
    // Forward logout POST to backend /logout
    return forward(request, '/logout', { method: 'POST' });
}
