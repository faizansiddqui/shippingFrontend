import { forward } from '../_utils/proxy';

export async function GET(request) {
    const url = new URL(request.url);
    const path = `/get/pickup_location${url.search}`;
    return forward(request, path, { method: 'GET' });
}
