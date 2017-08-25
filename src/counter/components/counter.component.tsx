import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { path } from 'ramda';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { CounterAction, decrementCounter, incrementCounter, resetCounter } from '../counter.actions';
import { AppState } from '../../configureStore';

interface Props {
  value: number;
  increment: () => CounterAction;
  decrement: () => CounterAction;
  reset: () => CounterAction;
}

const Container = styled.div`
  color: red;
`;

function Counter(props: Props) {
  return (
    <Container>
      <button onClick={() => props.increment()}>Increment</button>
      <div>Current Count: {props.value}</div>
      <button onClick={() => props.decrement()}>Decrement</button>

      <button onClick={() => props.reset()}>Reset Counter</button>
    </Container>
  );
}

function mapDispatchToProps(dispatch: Dispatch<AppState>) {
  return bindActionCreators(
    {
      increment: incrementCounter,
      decrement: decrementCounter,
      reset: resetCounter,
    },
    dispatch,
  );
}

const mapStateToProps = (state: AppState) => ({
  value: path(['counter', 'value'], state),
});

export const CounterComponent = connect(mapStateToProps, mapDispatchToProps)(Counter);
