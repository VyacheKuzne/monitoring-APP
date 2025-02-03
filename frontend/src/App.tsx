import React from 'react';
import './App.css';
import ModalBlock from './block/ModalBlock'
import InfoBlock from './block/InfoBlock'
function App() {
  return (
    <div className="App font-montserrat grid grid-cols-[300px_84%]">
      <ModalBlock/>
      <InfoBlock/>
    </div>
  );
}
export default App;
