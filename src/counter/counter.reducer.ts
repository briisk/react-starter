import { CounterAction, DECREMENT, INCREMENT, RESET, SET_VALUE, SetValuePayload } from './counter.actions';
import { evolve, dec, assoc } from 'ramda';

export interface CounterState {
  value: number;
}

export const counterInitialState: CounterState = {
  value: 0,
};

const actions = {
  [INCREMENT]: (payload?: any) => (state: CounterState) => ({ ...state, value: state.value + 1 }),
  [DECREMENT]: (payload?: any) => evolve<CounterState>({ value: dec }),
  [SET_VALUE]: (payload: SetValuePayload) => assoc('value', payload.value),
  [RESET]: (payload?: any) => assoc('value', 0),
};

export function counterReducer(state: CounterState = counterInitialState, action: CounterAction): CounterState {
  const stateChangingFn = actions[action.type];
  return !!stateChangingFn ? stateChangingFn(action.payload)(state) : state;
}

