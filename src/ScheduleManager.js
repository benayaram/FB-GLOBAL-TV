import React, { useState } from 'react';
import "./ScheduleManager.css";

const ScheduleManager = () => {
  const [newSchedule, setNewSchedule] = useState({
    title: '',
    speakerName: '',
    videoUrl: '',
    startTime: '',
    endTime: '',
  });
  const [schedules, setSchedules] = useState([]);

  const handleChange = (e) => {
    setNewSchedule({
      ...newSchedule,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Extract video ID from URL
    const videoId = new URL(newSchedule.videoUrl).searchParams.get('v');
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/0.jpg`;

    const scheduleWithThumbnail = { ...newSchedule, thumbnailUrl };

    setSchedules([...schedules, scheduleWithThumbnail]);

    // Clear form
    setNewSchedule({
      title: '',
      speakerName: '',
      videoUrl: '',
      startTime: '',
      endTime: '',
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(schedules, null, 2));
    alert('JSON data copied to clipboard!');
  };

  const handleViewSchedules = () => {
    window.location.href = '/json';
  };

  const handleLiveVideo = () => {
    window.location.href = '/video';
  };

  return (
    <div className="schedule-manager-container">
      <h1 className="schedule-manager-header">Schedule Manager</h1>
      <form className="schedule-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={newSchedule.title}
          onChange={handleChange}
          className="schedule-input"
          required
        />
        <input
          type="text"
          name="speakerName"
          placeholder="Speaker Name"
          value={newSchedule.speakerName}
          onChange={handleChange}
          className="schedule-input"
          required
        />
        <input
          type="url"
          name="videoUrl"
          placeholder="Video URL"
          value={newSchedule.videoUrl}
          onChange={handleChange}
          className="schedule-input"
          required
        />
        <input
          type="datetime-local"
          name="startTime"
          value={newSchedule.startTime}
          onChange={handleChange}
          className="schedule-input"
          required
        />
        <input
          type="datetime-local"
          name="endTime"
          value={newSchedule.endTime}
          onChange={handleChange}
          className="schedule-input"
          required
        />
        <div className="schedule-buttons">
          <button type="submit" className="submit-button">Add Schedule</button>
          <button type="button" onClick={handleCopy} className="copy-json-button">Copy JSON</button>
          <button type="button" onClick={handleViewSchedules} className="view-schedules-button">View Schedule</button>
          <button type="button" onClick={handleLiveVideo} className="live-video-button">Live Video</button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleManager;