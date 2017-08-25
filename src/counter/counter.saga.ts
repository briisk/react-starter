import { put, takeEvery } from 'redux-saga/effects';
import { INCREMENT, setValueInCounter } from './counter.actions';
import { CALL_API } from 'redux-api-middleware';

function* increment() {
  yield put(setValueInCounter({ value: 2 }));
  yield put({
    [CALL_API]: {
      endpoint: 'https://swapi.co/api/people/1/',
      method: 'GET',
      types: ['REQUEST_SWAPI', 'SUCCESS_SWAPI', 'FAILURE_SWAPI'],
    },
  } as any);
}

export function* counterSaga() {
  yield takeEvery(INCREMENT, increment);
}
