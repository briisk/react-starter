/* tslint:disable */
import { MiddlewareAPI, Dispatch, Action } from 'redux';

export const API_CALL = 'API_CALL';

const absoluteURLPattern = /^((?:https:\/\/)|(?:http:\/\/)|(?:www))/;
function generateUrl(url: string, baseUrl: string): string {
  return url.match(absoluteURLPattern) ? url : baseUrl + url;
}

export interface Config {
  success: string;
  failure: string;
  type?: string;
}

interface ApiCallAction extends Action {
  payload: {
    method: string;
    path: string;
    config: Config;
    body?: any;
    headers: any;
  }
}

export interface Api {
  get: (path: string, config: Config, headers?: any) => ApiCallAction;
  post: (path: string, body: any, config: Config, headers?: any) => ApiCallAction;
  put: (path: string, body: any, config: Config, headers?: any) => ApiCallAction;
  patch: (path: string, body: any, config: Config, headers?: any) => ApiCallAction;
  delete: (path: string, config: Config, headers?: any) => ApiCallAction;
}


export const api: Api = {
  get: (path, config, headers = {}) => {
    return {
      type: API_CALL,
      payload: {
        path,
        config,
        method: 'GET',
        headers,
      },
    };
  },
  post: (path, body, config, headers = {}) => {
    return {
      type: API_CALL,
      payload: {
        path,
        config,
        method: 'POST',
        body,
        headers,
      },
    };
  },
  put: (path, body, config, headers = {}) => {
    return {
      type: API_CALL,
      payload: {
        path,
        config,
        method: 'PUT',
        body,
        headers,
      },
    };
  },
  patch: (path, body, config, headers = {}) => {
    return {
      type: API_CALL,
      payload: {
        path,
        config,
        method: 'PATCH',
        body,
        headers,
      },
    };
  },
  delete: (path, config, headers = {}) => {
    return {
      type: API_CALL,
      payload: {
        path,
        config,
        method: 'DELETE',
        headers,
      },
    };
  },
};

interface ApiConfig {
  headers: {
    [key: string]: string|string[];
  },
  baseUrl: string;
}

function getStateHeaders(headers: any, state: any): any {
  return Object.keys(headers).reduce((acc: any, curr: string) => {
    if (Array.isArray(acc[curr])) {
      let stateValue = state;
      let index = 0;
      while (index < acc[curr].length) {
        if (stateValue == null) {
          return {
            ...acc,
            [curr]: '',
          };
        }
        stateValue = stateValue[acc[curr][index]];
        index += 1;
      }

      return {
        ...acc,
        [curr]: String(stateValue) || '',
      }
    }
    return acc;
  }, headers);
}

export const apiMiddlewareCreator: any =
  (apiConfig: ApiConfig) => {
    const defaultHeaders = {
      Accept: 'application/json',
     'Content-Type': 'application/json',
    };

    return <S>({ getState }: MiddlewareAPI<S>) =>
      (next: Dispatch<S>) =>
        async (action: ApiCallAction): Promise<any> => {
          if (action.type !== API_CALL) {
            return next(action);
          }

          next({ ...action, type: action.payload.config.type || action.type });

          const state = getState();
          const headers = {
            ...defaultHeaders,
            ...getStateHeaders(apiConfig.headers, state),
            ...getStateHeaders(action.payload.headers, state),
          };

          const baseUrl = generateUrl(action.payload.path, apiConfig.baseUrl || '');
          const response = await fetch(baseUrl, {
            method: action.payload.method,
            headers,
            body: JSON.stringify(['POST', 'PATCH', 'PUT'].includes(action.payload.method) ? action.payload.body : undefined)
          });

          let json;
          let error;
          try {
            json = await response.json();
          } catch (_) {
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
  };
