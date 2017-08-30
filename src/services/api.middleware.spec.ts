import { api, apiMiddlewareCreator, API_CALL } from './api.middleware';
import { Dispatch } from 'redux';

let next: Dispatch<any>;
let mocks: any;

const isWithBody = (method: string) => !['GET', 'DELETE'].includes(method);
const generateArgs = (method: string, mocks: any, absolutePath: string, areHeadersAdded: boolean) => {
  let args = [absolutePath || mocks.path];
  if (isWithBody(method)) {
    args = [...args, mocks.body];
  }
  args = [...args, mocks.config];
  if (areHeadersAdded) {
    args = [...args, mocks.headers];
  }
  return args;
};

const defaultHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

const generateMocks = (isCustomType: boolean) => ({
  payload: {
    some: 'payload' + Math.random(),
  },
  path: 'somePath' + Math.random(),
  config: {
    success: 'SUCCESS_ACTION' + Math.random(),
    failure: 'FAILURE_ACTION' + Math.random(),
    type: isCustomType ? 'ACTION_TYPE' + Math.random() : undefined,
  },
  status: 'status' + Math.random(),
  statusText: 'statusText' + Math.random(),
  body: {
    some: 'body' + Math.random(),
  },
  headers: {
    some: 'headers' + Math.random(),
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
      apiMiddlewareCreator({})({ getState: () => ({}) })(next)(action);
    });

    it('should call next with given action', function () {
      expect(next).toHaveBeenCalledWith(action);
    });
  });

  [{
    title: 'when there are default values',
    absolutePath: '',
    config: {
      headers: {},
    },
    expectedHeaders: {},
    getState: () => ({}),
    areHeadersAdded: false,
    isCustomType: false,
  }, {
    title: 'when there is absolute path with http and headers are passed',
    absolutePath: 'http://some.path',
    config: {
      headers: {},
    },
    expectedHeaders: {},
    getState: () => ({}),
    areHeadersAdded: true,
    isCustomType: false,
  }, {
    title: 'when there is absolute path with https and custom type is added',
    absolutePath: 'https://some.path',
    config: {
      headers: {},
    },
    expectedHeaders: {},
    getState: () => ({}),
    areHeadersAdded: false,
    isCustomType: true,
  }, {
    title: 'when there is absolute path with www',
    absolutePath: 'www.some.path',
    config: {
      headers: {},
    },
    expectedHeaders: {},
    getState: () => ({}),
    areHeadersAdded: false,
    isCustomType: false,
  }, {
    title: 'when header and baseUrl are added',
    absolutePath: '',
    config: {
      headers: {
        Authorization: 'authorization123',
      },
      baseUrl: 'someBaseUrl1234',
    },
    expectedHeaders: {
      Authorization: 'authorization123',
    },
    getState: () => ({}),
    areHeadersAdded: false,
    isCustomType: false,
  }, {
    title: 'when header is added from the store',
    absolutePath: '',
    config: {
      headers: {
        anotherHeader: 'someHeader1234',
        Authorization: ['config', 'user', 'token'],
        content: 'someContent45',
        num: ['config', 'number'],
      },
    },
    expectedHeaders: {
      anotherHeader: 'someHeader1234',
      Authorization: 'authorization234234',
      content: 'someContent45',
      num: '123',
    },
    getState: () => ({
      config: {
        number: 123,
        user: {
          token: 'authorization234234',
        },
      },
    }),
    areHeadersAdded: false,
    isCustomType: false,
  }, {
    title: 'when header is added from the store and it\'s not available',
    absolutePath: '',
    config: {
      headers: {
        anotherHeader: 'someHeader1234',
        Authorization: ['config1', 'user', 'token'],
        content: 'someContent45',
      },
    },
    expectedHeaders: {
      anotherHeader: 'someHeader1234',
      Authorization: '',
      content: 'someContent45',
    },
    getState: () => ({
      config: {
        user: {
          token: 'authorization234234',
        },
      },
    }),
    areHeadersAdded: false,
    isCustomType: false,
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
            mocks = generateMocks(apiConfig.isCustomType);
          });

          beforeEach(function () {
            spyOn(window, 'fetch').and.returnValue(testConfig.fetchValue(
              mocks.payload,
              mocks.status,
              mocks.statusText,
            ));
          });

          ['GET', 'PUT', 'POST', 'PATCH', 'DELETE'].forEach(method => {
            describe(`${method} method`, function () {
              beforeEach(function () {
                apiMiddlewareCreator(apiConfig.config)({ getState: apiConfig.getState })(next)(
                  api[method.toLowerCase()](
                    ...generateArgs(method, mocks, apiConfig.absolutePath, apiConfig.areHeadersAdded)
                  )
                );
              });

              it('should call fetch with proper arguments', function () {
                let headers = {
                  ...defaultHeaders, ...apiConfig.expectedHeaders
                };

                if (apiConfig.areHeadersAdded) {
                  headers = {
                    ...headers,
                    ...mocks.headers,
                  }
                }
                expect(window.fetch).toHaveBeenCalledWith(
                  apiConfig.absolutePath || (apiConfig.config.baseUrl || '') + mocks.path,
                  {
                    body: isWithBody(method) ? JSON.stringify(mocks.body) : undefined,
                    headers,
                    method,
                  }
                );
              });

              it(`should call next function with ${apiConfig.isCustomType ? 'custom type' : API_CALL} action`,
              function () {
                let headers = {};

                if (apiConfig.areHeadersAdded) {
                  headers = {
                    ...mocks.headers,
                  }
                }
                expect(next).toHaveBeenCalledWith({
                  type: apiConfig.isCustomType ? mocks.config.type : API_CALL,
                  payload: {
                    config: mocks.config,
                    method,
                    path: apiConfig.absolutePath || mocks.path,
                    body: isWithBody(method) ? mocks.body : undefined,
                    headers,
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
