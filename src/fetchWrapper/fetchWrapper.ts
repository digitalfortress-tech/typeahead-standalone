// A custom FETCH API wrapper
// inspired by https://jasonwatmore.com/post/2020/04/18/fetch-a-lightweight-fetch-wrapper-to-simplify-http-requests

const get = async function (url: RequestInfo | URL, requestOptions?: RequestInit): Promise<any> {
  const response = await fetch(
    url,
    requestOptions || {
      method: 'GET',
    }
  );
  return handleResponse(response);
};

// helper function
const handleResponse = async function (response: Response) {
  const text = await response.text();
  const data = text && JSON.parse(text);
  if (!response.ok) {
    return Promise.reject((data && data.message) || response.statusText);
  }
  return data;
};

export const fetchWrapper = {
  get,
};

/*
 * @deprecated: Post method not required at the moment
 */
// const post = async function (url: string, body: unknown): Promise<any> {
//   const requestOptions = {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(body),
//   };
//   const response = await fetch(url, requestOptions);
//   return handleResponse(response);
// };
