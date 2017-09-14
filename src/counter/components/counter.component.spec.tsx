import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { CounterComponent } from './counter.component';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { decrementCounter, incrementCounter, resetCounter } from '../counter.actions';

const initialState = {
  counter: {
    value: 3,
  },
};
let component: ReactWrapper;

const mockStore = configureStore();
const store = mockStore({ runtime: {}, ...initialState });

describe('CounterComponent', () => {
  beforeEach(() => {
    component = mount((
      <Provider store={store}>
        <CounterComponent />
      </Provider>
    ));
  });

  afterEach(() => {
    store.clearActions();
  });

  describe('when initial state is set', () => {
    it('renders counter value', () => {
      expect(component.find('div').at(1).text()).toEqual(`Current Count: ${initialState.counter.value}`);
    });

    describe('when increment button is clicked', () => {
      beforeAll(() => {
        component.find('button').first().simulate('click');
      });

      it('should dispatch increment action', () => {
        expect(store.getActions()[0]).toEqual(incrementCounter());
      });
    });

    describe('when decrement button is clicked', () => {
      beforeAll(() => {
        component.find('button').at(1).simulate('click');
      });

      it('should dispatch decrement action', () => {
        expect(store.getActions()[0]).toEqual(decrementCounter());
      });
    });

    describe('when reset button is clicked', () => {
      beforeAll(() => {
        component.find('button').at(2).simulate('click');
      });

      it('should dispatch reset action', () => {
        expect(store.getActions()[0]).toEqual(resetCounter());
      });
    });
  });
});
