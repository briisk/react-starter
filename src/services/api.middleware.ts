/* tslint:disable */
import { MiddlewareAPI, Dispatch } from 'redux';

const API_CALL = 'API_CALL';

const absoluteURLPattern = /^((?:https:\/\/)|(?:http:\/\/)|(?:www))/;
function generateUrl(url: string, baseUrl: string): string {
  return url.match(absoluteURLPattern) ? url : baseUrl + url;
}

export const api = {
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  baseUrl: 'https://swapi.co/api/',
  setHeader(key: string, value: string) {
    this.headers[key] = value;
  },
  removeHeader(key: string) {
    delete this.headers[key];
  },
  setBaseUrl(url: string) {
    this.baseUrl = url;
  },
  get: (path: string, config: any, params = {}) => {
    return {
      type: API_CALL,
      payload: {
        path,
        config,
        method: 'GET',
        params,
      },
    };
  },
  post: (path: string, body: any, config: any, params = {}) => {
    return {
      type: API_CALL,
      payload: {
        path,
        config,
        method: 'POST',
        params,
        body,
      },
    };
  },
  put: (path: string, body: any, config: any, params = {}) => {
    return {
      type: API_CALL,
      payload: {
        path,
        config,
        method: 'PUT',
        params,
        body,
      },
    };
  },
  patch: (path: string, body: any, config: any, params = {}) => {
    return {
      type: API_CALL,
      payload: {
        path,
        config,
        method: 'PATCH',
        params,
        body,
      },
    };
  },
  delete: (path: string, config: any, params = {}) => {
    return {
      type: API_CALL,
      payload: {
        path,
        config,
        method: 'DELETE',
        params,
      },
    };
  },
};

function getUrlQueryByObject(data: any) {
  return Object.keys(data)
    .reduce((prev, filter) => `${prev}&filter[${filter}]=${data[filter]}`.replace(/^&/, '?')
      , '');
}

export const apiMiddleware: any =
  <S>({ getState }: MiddlewareAPI<S>) =>
    (next: Dispatch<S>) =>
      async (action: any): Promise<any> => {
        if (action.type !== API_CALL) {
          return next(action);
        }

        const baseUrl = generateUrl(action.payload.path, api.baseUrl);
        const urlQuery = getUrlQueryByObject(action.payload.params);
        const response = await fetch(`${baseUrl}${urlQuery}`, {
          method: action.payload.method,
          headers: api.headers,
          body: JSON.stringify(['POST', 'PATCH', 'PUT'].includes(action.payload.method) ? action.payload.body : undefined)
        });

        let json;
        let error;
        try {
          json = await response.json();
        } catch(_) {
          error = `${response.status} ${response.statusText}`;
        }

        if (response.ok) {
          return next({
            payload: json,
            type: action.payload.config.success,
          });
        } else {
          return next({
            payload: error || json,
            type: action.payload.config.failure,
          });
        }
      };
