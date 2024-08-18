import React, { useState, useEffect } from 'react';
import './JsonViewer.css';

const JsonViewer = () => {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/schedules.json`)
    .then(response => response.json())
      .then(data => setSchedules(data))
      .catch(error => console.error('Error fetching schedules:', error));
  }, []);

  return (
    <div>
      <h1>Schedule View</h1>
      {schedules.map((schedule, index) => (
        <div key={index} className="schedule-card">
          <img src={schedule.thumbnailUrl} alt="Thumbnail" />
          <div>
            <h2>{schedule.title}</h2>
            <p>Speaker: {schedule.speakerName}</p>
            <p>Start Time: {new Date(schedule.startTime).toLocaleString()}</p>
            <p>End Time: {new Date(schedule.endTime).toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default JsonViewer;