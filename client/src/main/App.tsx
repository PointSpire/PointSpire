import React from 'react';
import './App.css';
import TopMenuBar from './components/TopMenuBar';

function App(): JSX.Element {
  return (
    <div className="App">
      <TopMenuBar />
      <header className="App-header">PointSpire</header>
    </div>
  );
}

export default App;
