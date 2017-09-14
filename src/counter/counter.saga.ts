import { put, takeEvery } from 'redux-saga/effects';
import { INCREMENT, setValueInCounter } from './counter.actions';
import { api } from 'redux-middleware-api-fetch';

export function* increment() {
  yield put(setValueInCounter({ value: 2 }));
  yield put(api.get('people/1/', {
    success: 'SUCCESS_ACTION',
    failure: 'FAILURE_ACTION',
  }));
}

export function* counterSaga() {
  yield takeEvery(INCREMENT, increment);
}
