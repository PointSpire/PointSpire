import React, { useState } from 'react';
// import Button from '@material-ui/core/Button';
import './App.css';
import Menu from './MenuComponents/MainMenu';
import TaskWindow from './Windows/TaskWindow';
import SettingsWindow from './Windows/SettingsWindow';

function App(): JSX.Element {
  // const [flipFlop, flipState] = useState(false);
  const [window, setWindow] = useState(0);

  const menuSelect = (select: number): void => {
    setWindow(select);
  };

  const displayWindow = (): JSX.Element => {
    if (window === 0) {
      return <TaskWindow />;
    }
    return <SettingsWindow />;
  };

  return (
    <div className="App">
      <Menu menuTitle="Point Spire" menuTrigger={menuSelect} />
      {displayWindow()}
    </div>
  );
}

export default App;
