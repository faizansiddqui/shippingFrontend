export class ApiError extends Error {
    constructor(message, status = 500, data = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

export async function apiFetch(path, opts = {}) {
    const init = Object.assign({ credentials: 'include' }, opts || {});

    const res = await fetch(path, init);

    const text = await res.text();
    let data = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch (err) {
        data = { message: text };
    }

    if (!res.ok) {
        const message = (data && (data.message || data.error || data.msg)) || res.statusText || 'Request failed';
        throw new ApiError(message, res.status, data);
    }

    return data;
}

export default apiFetch;
