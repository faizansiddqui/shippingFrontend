import { forward } from '../_utils/proxy';

export async function GET(request) {
    // preserve query string when forwarding
    const url = new URL(request.url);
    const path = `/fetchPickupLocationPicode${url.search}`;
    return forward(request, path, { method: 'GET' });
}
