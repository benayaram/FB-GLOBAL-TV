import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ScheduleManager from './ScheduleManager';
import JsonViewer from './JsonViewer';
import VideoPlayer from './VideoPlayer';
import './App.css';

function App() {
  const basename = process.env.NODE_ENV === 'production' ? '/FB-GLOBAL-TV' : '';

  return (
    <Router basename={basename}>
      <div className="App">
        <Routes>
          <Route path="/FB-GLOBAL-TV" element={<ScheduleManager />} />
          <Route path="/json" element={<JsonViewer />} />
          <Route path="/video" element={<VideoPlayer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
