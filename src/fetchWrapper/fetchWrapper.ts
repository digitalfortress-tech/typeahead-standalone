// A custom FETCH API wrapper
// inspired by https://jasonwatmore.com/post/2020/04/18/fetch-a-lightweight-fetch-wrapper-to-simplify-http-requests

type WithTimeout = { timeout?: number };

const get = async function (url: RequestInfo | URL, requestOptions?: RequestInit): Promise<unknown> {
  const options: RequestInit & WithTimeout = { method: 'GET', ...(requestOptions || {}) };

  // opt-in timeout (ms): pass `timeout` within requestOptions to auto-abort a slow request.
  // Defaults to off, so default behaviour is unchanged. Ignored if the caller supplies its own signal.
  const timeout = Number((options as WithTimeout).timeout) || 0;
  delete (options as WithTimeout).timeout;

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  if (timeout > 0 && !options.signal && typeof AbortController !== 'undefined') {
    const controller = new AbortController();
    options.signal = controller.signal;
    timeoutId = setTimeout(() => controller.abort(), timeout);
  }

  try {
    const response = await fetch(url, options);
    return await handleResponse(response);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

// helper function
const handleResponse = async function (response: Response) {
  const text = await response.text();

  let data: { message?: string } | string | undefined;
  try {
    data = text && JSON.parse(text);
  } catch {
    // Non-JSON response body - reject cleanly instead of letting a raw SyntaxError escape the wrapper
    return Promise.reject(response.statusText || 'Invalid response');
  }

  if (!response.ok) {
    return Promise.reject((data && (data as { message?: string }).message) || response.statusText);
  }
  return data;
};

export const fetchWrapper = {
  get,
};
