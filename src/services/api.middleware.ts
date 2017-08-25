/* tslint:disable */
import { MiddlewareAPI, Dispatch, Action } from 'redux';

const API_CALL = 'API_CALL';

const absoluteURLPattern = /^((?:https:\/\/)|(?:http:\/\/)|(?:www))/;
function generateUrl(url: string, baseUrl: string): string {
  return url.match(absoluteURLPattern) ? url : baseUrl + url;
}

interface Config {
  success: string;
  failure: string;
  type?: string;
}

interface Api {
  headers: {
    [key: string]: string;
  };
  baseUrl: string;
  headersFunctions: Array<(state: any) => {
    [key: string]: string;
  }>;
  setHeader: (key: string, value: string) => void;
  setHeaderFromState: (fn: (state: any) => {
    [key: string]: string;
  }) => void;
  removeHeader: (key: string) => void;
  setBaseUrl: (url: string) => void;
  get: (path: string, config: Config, params?: any) => Action;
  post: (path: string, body: any, config: Config, params?: any) => Action;
  put: (path: string, body: any, config: Config, params?: any) => Action;
  patch: (path: string, body: any, config: Config, params?: any) => Action;
  delete: (path: string, config: Config, params?: any) => Action;
}

export const api: Api = {
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  baseUrl: 'https://swapi.co/api/',
  headersFunctions: [],
  setHeader(key, value) {
    this.headers[key] = value;
  },
  setHeaderFromState(fn) {
    this.headersFunctions = [...this.headersFunctions, fn]
  },
  removeHeader(key) {
    delete this.headers[key];
  },
  setBaseUrl(url: string) {
    this.baseUrl = url;
  },
  get: (path, config, params = {}) => {
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
  post: (path, body, config, params = {}) => {
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
  put: (path, body, config, params = {}) => {
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
  patch: (path, body, config, params = {}) => {
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
  delete: (path, config, params = {}) => {
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

interface ApiCallAction extends Action {
  payload: {
    method: string;
    path: string;
    config: Config;
    params: {
      [key: string]: string;
    };
    body: any;
  }
}

export const apiMiddleware: any =
  <S>({ getState }: MiddlewareAPI<S>) =>
    (next: Dispatch<S>) =>
      async (action: ApiCallAction): Promise<any> => {
        if (action.type !== API_CALL) {
          return next(action);
        }

        next({ ...action, type: action.payload.config.type || action.type });

        const state = getState();
        const headers = api.headersFunctions.reduce((acc, fn: any) => ({ ...acc, ...fn(state) }),  api.headers);

        const baseUrl = generateUrl(action.payload.path, api.baseUrl);
        const urlQuery = getUrlQueryByObject(action.payload.params);
        const response = await fetch(`${baseUrl}${urlQuery}`, {
          method: action.payload.method,
          headers,
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
