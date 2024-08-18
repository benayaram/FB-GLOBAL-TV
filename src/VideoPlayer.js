import React, { useState, useEffect, useRef } from 'react';
import './VideoPlayer.css'; // Import the CSS file for styling

const VideoPlayer = () => {
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [placeholderImage, setPlaceholderImage] = useState(null);
  const [noVideoMessage, setNoVideoMessage] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/schedules.json`)
    .then(response => response.json())
      .then(data => {
        const now = new Date();
        const activeSchedule = data.find(schedule => {
          const startTime = new Date(schedule.startTime);
          const endTime = new Date(schedule.endTime);
          return now >= startTime && now <= endTime;
        });

        if (activeSchedule) {
          const videoId = new URL(activeSchedule.videoUrl).searchParams.get('v');
          setCurrentSchedule(activeSchedule);
          setPlaceholderImage(`https://img.youtube.com/vi/${videoId}/0.jpg`);
          setNoVideoMessage(null);
        } else {
          setCurrentSchedule(null);
          setNoVideoMessage("No video is scheduled at this time.");
        }
      })
      .catch(error => console.error('Error fetching schedules:', error));
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      const handleTimeUpdate = () => {
        const now = new Date().getTime();
        const startTime = new Date(currentSchedule.startTime).getTime();
        const endTime = new Date(currentSchedule.endTime).getTime();
        const adjustedTime = Math.max(0, (now - startTime) / 1000);
        const videoDuration = Math.min((endTime - startTime) / 1000, videoRef.current?.duration || 0);

        if (adjustedTime > videoDuration) {
          videoRef.current.currentTime = videoDuration;
          setIsPlaying(false);
        }
      };

      const handleEnded = () => {
        if (videoRef.current.currentTime < videoRef.current.duration) {
          setIsPlaying(false);
        }
      };

      videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
      videoRef.current.addEventListener('ended', handleEnded);

      return () => {
        videoRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        videoRef.current.removeEventListener('ended', handleEnded);
      };
    }
  }, [videoRef.current, currentSchedule]);

  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = ((hours + 11) % 12 + 1);
    return `${formattedHours}:${minutes < 10 ? '0' : ''}${minutes} ${period}`;
  };

  return (
    <div className="video-player-container">
      {noVideoMessage ? (
        <div className="no-video-message">
          <h1>{noVideoMessage}</h1>
        </div>
      ) : (
          <div className="video-wrapper">
            {currentSchedule ? (
              <iframe
                ref={videoRef}
                src={`https://www.youtube.com/embed/${new URL(currentSchedule.videoUrl).searchParams.get('v')}?autoplay=1&start=${Math.floor((new Date().getTime() - new Date(currentSchedule.startTime).getTime()) / 1000)}&end=${Math.floor((new Date(currentSchedule.endTime).getTime() - new Date(currentSchedule.startTime).getTime()) / 1000)}&playsinline=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="video-iframe"
              ></iframe>
            ) : (
              <img src={placeholderImage} alt="Placeholder" className="placeholder-image" />
            )}
          </div>
          
      )}
    </div>
  );
};

export default VideoPlayer;
