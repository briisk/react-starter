import { api, apiMiddleware, API_CALL, Api } from './api.middleware';
import { Dispatch } from 'redux';

let next: Dispatch<any>;
let mocks: any;

const isWithBody = (method: string) => !['GET', 'DELETE'].includes(method);
const generateArgs = (method: string, mocks: any, absolutePath: string) => {
  let args = [absolutePath || mocks.path];
  if (isWithBody(method)) {
    args = [...args, mocks.body];
  }
  args = [...args, mocks.config];
  return args;
};

const defaultHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

const generateMocks = () => ({
  payload: {
    some: 'payload' + Math.random(),
  },
  path: 'somePath' + Math.random(),
  config: {
    success: 'SUCCESS_ACTION' + Math.random(),
    failure: 'FAILURE_ACTION' + Math.random(),
  },
  status: 'status' + Math.random(),
  statusText: 'statusText' + Math.random(),
  body: {
    some: 'body' + Math.random(),
  },
  params: {
    some: 'params' + Math.random(),
  },
});

const successFetch = (payload?: any) =>
  new Promise(resolve => resolve({
    ok: true,
    json: () => new Promise(resolve2 => resolve2(payload)),
  }));

const failureJsonFetch = (payload?: any, status?: string, statusText?: string) =>
  new Promise(resolve => resolve({
    ok: false,
    json: () => new Promise((resolve2, reject) => reject(payload)),
    status,
    statusText,
  }));

const failureWithProperJsonFetch = (payload?: any) =>
  new Promise(resolve => resolve({
    ok: false,
    json: () => new Promise(resolve2 => resolve2(payload)),
  }));

interface TestConfig {
  fetchValue: any;
  title: string;
  returnedPayload: any;
  returnedAction: any;
}

describe('API Middleware', () =>{
  beforeEach(function () {
    next = jasmine.createSpy('next');
  });

  describe(`when action is not ${API_CALL}`, function () {
    const action = {
      type: '123456789',
    };

    beforeEach(() => {
      apiMiddleware({ getState: () => ({}) })(next)(action);
    });

    it('should call next with given action', function () {
      expect(next).toHaveBeenCalledWith(action);
    });
  });

  [{
    title: 'when there are default values',
    absolutePath: '',
    headers: {},
    prepareApi: () => {},
    getState: () => ({}),
  }, {
    title: 'when there is absolute path with http',
    absolutePath: 'http://some.path',
    headers: {},
    prepareApi: () => {},
    getState: () => ({}),
  }, {
    title: 'when there is absolute path with https',
    absolutePath: 'https://some.path',
    headers: {},
    prepareApi: () => {},
    getState: () => ({}),
  }, {
    title: 'when there is absolute path with www',
    absolutePath: 'www.some.path',
    headers: {},
    prepareApi: () => {},
    getState: () => ({}),
  }, {
    title: 'when two headers are added and one is removed',
    absolutePath: '',
    headers: {
      Authorization: 'authorization123',
    },
    prepareApi: function (api: Api) {
      api.setHeader('bla', 'blabla');
      api.setHeader('Authorization', this.headers.Authorization);
      api.removeHeader('bla');
      return api;
    },
    getState: () => ({}),
  }, {
    title: 'when header is added from the store',
    absolutePath: '',
    headers: {
      Authorization: 'authorization234234',
    },
    prepareApi: function (api: Api) {
      api.setHeaderFromState((state: any) => ({ Authorization: state.config.user.token }));
      return api;
    },
    getState: () => ({
      config: {
        user: {
          token: 'authorization234234',
        },
      },
    }),
  }].forEach((apiConfig: any) => {
    describe(apiConfig.title, function () {
      [{
        fetchValue: (...args: any[]) => successFetch(...args),
        title: 'and fetch returns success',
        returnedPayload: (mocks: any) => mocks.payload,
        returnedAction: (mocks: any) => mocks.config.success,
      }, {
        fetchValue: (...args: any[]) => failureJsonFetch(...args),
        title: 'and fetch.json() returns failure',
        returnedPayload: (mocks: any) => `${mocks.status} ${mocks.statusText}`,
        returnedAction: (mocks: any) => mocks.config.failure,
      }, {
        fetchValue: (...args: any[]) => failureWithProperJsonFetch(...args),
        title: 'and fetch returns failure',
        returnedPayload: (mocks: any) => mocks.payload,
        returnedAction: (mocks: any) => mocks.config.failure,
      }].forEach((testConfig: TestConfig) => {

        describe(testConfig.title, function () {
          beforeAll(function() {
            mocks = generateMocks();
          });

          beforeEach(function () {
            apiConfig.prepareApi(api);
            spyOn(window, 'fetch').and.returnValue(testConfig.fetchValue(mocks.payload, mocks.status, mocks.statusText));
          });

          ['GET', 'PUT', 'POST', 'PATCH', 'DELETE'].forEach(method => {
            describe(`${method} method`, function () {
              beforeEach(function () {
                apiMiddleware({ getState: apiConfig.getState })(next)(
                  api[method.toLowerCase()](...generateArgs(method, mocks, apiConfig.absolutePath))
                );
              });

              it('should call fetch with proper arguments', function () {
                expect(window.fetch).toHaveBeenCalledWith(apiConfig.absolutePath || mocks.path, {
                  body: isWithBody(method) ? JSON.stringify(mocks.body) : undefined,
                  headers: {...defaultHeaders, ...apiConfig.headers},
                  method,
                });
              });

              it('should call next function with API_CALL action', function () {
                expect(next).toHaveBeenCalledWith({
                  type: API_CALL,
                  payload: {
                    config: mocks.config,
                    method,
                    path: apiConfig.absolutePath || mocks.path,
                    body: isWithBody(method) ? mocks.body : undefined,
                  }
                });
              });

              it('should call next function with success action', function () {
                expect(next).toHaveBeenCalledWith({
                  payload: testConfig.returnedPayload(mocks),
                  type: testConfig.returnedAction(mocks),
                });
              });
            });
          });
        });
      });
    });
  });
});
