import { combineReducers, applyMiddleware, createStore, compose } from 'redux';
import { routerReducer, routerMiddleware } from 'react-router-redux';
import createBrowserHistory from 'history/createBrowserHistory';
import reduxSaga from 'redux-saga';
import { fork } from 'redux-saga/effects';
import { counterSaga } from './counter/counter.saga';
import { counterReducer as counter, CounterState, counterInitialState } from './counter/counter.reducer';
import * as storage from 'redux-storage';
import createEngine from 'redux-storage-engine-localstorage';
import { apiMiddlewareCreator } from 'redux-middleware-api-fetch';

import { environment } from './environments';
import { AppState } from './configureStore';

const apiMiddleware = apiMiddlewareCreator({
  baseUrl: environment.URL,
  headers: {
    Authorization: ['counter', 'value'],
  },
});

export const history = createBrowserHistory();
const sagaMiddleware = reduxSaga();

export interface AppState {
  counter: CounterState;
}

export function configureStore() {
  const storeKey = 'react-starter';

  const initialState = {
    counter: counterInitialState,
  };
  const reducer = storage.reducer(combineReducers({
    counter,
    router: routerReducer,
  }));

  const devTools = '__REDUX_DEVTOOLS_EXTENSION_COMPOSE__';
  const composeEnhancers = window[devTools] || compose;

  const engine = createEngine(storeKey);
  const middleware = storage.createMiddleware(engine);
  const createStoreWithMiddleware = composeEnhancers(
    applyMiddleware(...[routerMiddleware(history), sagaMiddleware, middleware, apiMiddleware]))(createStore);

  const load = storage.createLoader(engine);
  const cachedStore = typeof window !== 'undefined'
    ? !!localStorage.getItem(storeKey)
    : false;

  const store = initialState && !cachedStore ?
    createStoreWithMiddleware(reducer, initialState) :
    createStoreWithMiddleware(reducer);

  if (cachedStore) {
    load(store);
  }

  function* rootSaga() {
    yield [
      fork(counterSaga),
    ];
  }

  sagaMiddleware.run(rootSaga);

  return store;
}
