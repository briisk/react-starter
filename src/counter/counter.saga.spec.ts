import { counterSaga, increment } from './counter.saga';
import { put, takeEvery } from 'redux-saga/effects';
import { INCREMENT, setValueInCounter } from './counter.actions';
import { api } from 'redux-middleware-api-fetch';

let iterator: any;

describe('counterSaga', () => {
  beforeAll(() => {
    iterator = counterSaga();
  });

  it('should call takeEvery', () => {
    expect(iterator.next().value).toEqual(takeEvery(INCREMENT, increment));
  });
});

describe('increment', () => {
  beforeAll(() => {
    iterator = increment();
  });

  it('should dispatch setValueInCounter with value = 2', () => {
    expect(iterator.next().value).toEqual(put(setValueInCounter({ value: 2 })));
  });

  it('should dispatch api call', () => {
    expect(iterator.next().value).toEqual(put(api.get('people/1/', {
      success: 'SUCCESS_ACTION',
      failure: 'FAILURE_ACTION',
    })));
  });
});
