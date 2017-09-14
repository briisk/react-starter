import { counterReducer } from './counter.reducer';
import { decrementCounter, incrementCounter, resetCounter, setValueInCounter } from './counter.actions';

const initialState = {
  value: 3,
};

describe('Counter Reducer', () => {
  describe('Increment Action', () => {
    it('should increment value', () => {
      expect(counterReducer(initialState, incrementCounter())).toEqual({
        value: initialState.value + 1,
      });
    });
  });

  describe('Decrement Action', () => {
    it('should decrement value', () => {
      expect(counterReducer(initialState, decrementCounter())).toEqual({
        value: initialState.value - 1,
      });
    });
  });

  describe('Set Value Action', () => {
    it('should set value', () => {
      const newVal = 5;
      expect(counterReducer(initialState, setValueInCounter({ value: newVal }))).toEqual({
        value: newVal,
      });
    });
  });

  describe('Reset Action', () => {
    it('should set value to 0', () => {
      expect(counterReducer(initialState, resetCounter())).toEqual({
        value: 0,
      });
    });
  });
});
