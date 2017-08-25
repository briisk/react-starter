import * as React from 'react';
import './App.css';
import { CounterComponent } from './counter/components/counter.component';


class App extends React.Component {
  render() {
    return (
      <CounterComponent />
    );
  }
}

export default App;
