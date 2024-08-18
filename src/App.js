import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ScheduleManager from './ScheduleManager.js';
import JsonViewer from './JsonViewer.js';
import VideoPlayer from './VideoPlayer.js';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<ScheduleManager />} />
          <Route path="/json" element={<JsonViewer />} />
          <Route path="/video" element={<VideoPlayer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
