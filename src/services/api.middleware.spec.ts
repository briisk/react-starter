import { api, apiMiddleware, API_CALL } from './api.middleware';
import { Dispatch } from 'redux';

const getState = () => ({});
let next: Dispatch<any>;
let mocks: any;

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
});

const successFetch = (payload: any) =>
  new Promise(resolve => resolve({
    ok: true,
    json: () => new Promise(resolve2 => resolve2(payload)),
  }));

const failureJsonFetch = (payload: any, status: string, statusText: string) =>
  new Promise(resolve => resolve({
    ok: false,
    json: () => new Promise((resolve2, reject) => reject(payload)),
    status,
    statusText,
  }));

const failureWithProperJsonFetch = (payload: any) =>
  new Promise(resolve => resolve({
    ok: false,
    json: () => new Promise(resolve2 => resolve2(payload)),
  }));

describe('API Middleware', () =>{
  beforeEach(function () {
    next = jasmine.createSpy('next');
  });

  describe('when there are default values', function () {
    describe('and fetch returns success', function () {
      beforeAll(function() {
        mocks = generateMocks();
      });

      beforeEach(function () {
        spyOn(window, 'fetch').and.returnValue(successFetch(mocks.payload));
      });

      describe('get method', function () {
        beforeEach(function () {
          apiMiddleware({ getState })(next)(api.get(mocks.path, mocks.config));
        });

        it('should call fetch with proper arguments', function () {
          expect(window.fetch).toHaveBeenCalledWith(mocks.path, {
            body: undefined,
            headers: defaultHeaders,
            method: 'GET'
          });
        });

        it('should call next function with API_CALL action', function () {
          expect(next).toHaveBeenCalledWith({
            type: API_CALL,
            payload: {
              config: mocks.config,
              method: 'GET',
              params: {},
              path: mocks.path,
            }
          });
        });

        it('should call next function with success action', function () {
          expect(next).toHaveBeenCalledWith({
            payload: mocks.payload,
            type: mocks.config.success,
          });
        });
      });
    });

    describe('and fetch.json() returns failure', function () {
      beforeAll(function() {
        mocks = generateMocks();
      });

      beforeEach(function () {
        spyOn(window, 'fetch').and.returnValue(failureJsonFetch(mocks.payload, mocks.status, mocks.statusText));
      });

      describe('get method', function () {
        beforeEach(function () {
          apiMiddleware({ getState })(next)(api.get(mocks.path, mocks.config));
        });

        it('should call fetch with proper arguments', function () {
          expect(window.fetch).toHaveBeenCalledWith(mocks.path, {
            body: undefined,
            headers: defaultHeaders,
            method: 'GET'
          });
        });

        it('should call next function with API_CALL action', function () {
          expect(next).toHaveBeenCalledWith({
            type: API_CALL,
            payload: {
              config: mocks.config,
              method: 'GET',
              params: {},
              path: mocks.path,
            }
          });
        });

        it('should call next function with failure action', function () {
          expect(next).toHaveBeenCalledWith({
            payload: `${mocks.status} ${mocks.statusText}`,
            type: mocks.config.failure,
          });
        });
      });
    });

    describe('and fetch returns failure', function () {
      beforeAll(function() {
        mocks = generateMocks();
      });

      beforeEach(function () {
        spyOn(window, 'fetch').and.returnValue(failureWithProperJsonFetch(mocks.payload));
      });

      describe('get method', function () {
        beforeEach(function () {
          apiMiddleware({ getState })(next)(api.get(mocks.path, mocks.config));
        });

        it('should call fetch with proper arguments', function () {
          expect(window.fetch).toHaveBeenCalledWith(mocks.path, {
            body: undefined,
            headers: defaultHeaders,
            method: 'GET'
          });
        });

        it('should call next function with API_CALL action', function () {
          expect(next).toHaveBeenCalledWith({
            type: API_CALL,
            payload: {
              config: mocks.config,
              method: 'GET',
              params: {},
              path: mocks.path,
            }
          });
        });

        it('should call next function with failure action', function () {
          expect(next).toHaveBeenCalledWith({
            payload: mocks.payload,
            type: mocks.config.failure,
          });
        });
      });
    });
  });
});
