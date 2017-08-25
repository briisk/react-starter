import * as React from 'react';
import './App.css';
import { CounterComponent } from './counter/components/counter.component';
import { environment } from './environments';
import { api } from './services/api.middleware';

api.setBaseUrl(environment.URL);

class App extends React.Component {
  render() {
    return (
      <CounterComponent />
    );
  }
}

export default App;
