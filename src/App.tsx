import * as React from 'react';
import './App.css';
import { CounterComponent } from './counter/components/counter.component';
import { environment } from './environments';
import { api } from './services/api.middleware';
import { AppState } from './configureStore';

api.setBaseUrl(environment.URL);
api.setHeaderFromState((state: AppState) => ({ Authorization: state.counter.value.toString() }));


class App extends React.Component {
  render() {
    return (
      <CounterComponent />
    );
  }
}

export default App;
