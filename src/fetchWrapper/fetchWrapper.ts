// A custom FETCH API wrapper
// inspired by https://jasonwatmore.com/post/2020/04/18/fetch-a-lightweight-fetch-wrapper-to-simplify-http-requests

const get = function (url: string): Promise<any> {
  const requestOptions = {
    method: 'GET',
  };
  return fetch(url, requestOptions).then(handleResponse);
};

const post = function (url: string, body: Record<string, unknown>): Promise<any> {
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
  return fetch(url, requestOptions).then(handleResponse);
};

// helper functions
const handleResponse = function (response: Response) {
  return response.text().then((text: string) => {
    const data = text && JSON.parse(text);

    if (!response.ok) {
      const error = (data && data.message) || response.statusText;
      return Promise.reject(error);
    }

    return data;
  });
};

export const fetchWrapper = {
  get,
  post,
};
