import React, { useState, useEffect, useRef } from 'react';
import './VideoPlayer.css';

const VideoPlayer = () => {
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [nextSchedule, setNextSchedule] = useState(null);
  const [noVideoMessage, setNoVideoMessage] = useState(null);
  const [videoCompletedMessage, setVideoCompletedMessage] = useState(null);
  const videoRef = useRef(null);

  // Function to update the current and next schedule
  const updateSchedule = async () => {
    try {
      const response = await fetch(`${process.env.PUBLIC_URL}/schedules.json`);
      const data = await response.json();
      const now = new Date();

      // Find the active schedule
      const activeSchedule = data.find(schedule => {
        const startTime = new Date(schedule.startTime);
        const endTime = new Date(schedule.endTime);
        return now >= startTime && now <= endTime;
      });

      // Find the next schedule
      const upcomingSchedule = data.find(schedule => {
        const startTime = new Date(schedule.startTime);
        return now < startTime;
      });

      setCurrentSchedule(activeSchedule || null);
      setNextSchedule(upcomingSchedule || null);

      if (!activeSchedule) {
        if (upcomingSchedule) {
          setNoVideoMessage("No video is scheduled at this time.");
        } else {
          setNoVideoMessage("No further videos are scheduled.");
        }
      } else {
        setNoVideoMessage(null);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setNoVideoMessage("Error loading schedule.");
    }
  };

  useEffect(() => {
    updateSchedule(); // Initial check
    const intervalId = setInterval(updateSchedule, 60000); // Check every minute
    return () => clearInterval(intervalId); // Clean up on unmount
  }, []);

  useEffect(() => {
    if (videoRef.current && currentSchedule) {
      const handleTimeUpdate = () => {
        const now = new Date().getTime();
        const startTime = new Date(currentSchedule.startTime).getTime();
        const endTime = new Date(currentSchedule.endTime).getTime();
        const adjustedTime = Math.max(0, (now - startTime) / 1000);
        const videoDuration = videoRef.current.duration || 0;

        if (adjustedTime > videoDuration) {
          setVideoCompletedMessage("This video is completed before the scheduled end time.");
        } else {
          setVideoCompletedMessage(null);
        }
      };

      const handleEnded = () => {
        const now = new Date();
        const endTime = new Date(currentSchedule.endTime);

        if (now >= endTime && nextSchedule) {
          const nextStartTime = new Date(nextSchedule.startTime).getTime();
          const timeUntilNextStart = nextStartTime - now.getTime();

          if (timeUntilNextStart > 0) {
            setNoVideoMessage("No video is scheduled at this time.");
            setCurrentSchedule(null);

            // Set a timeout to start the next video when the time arrives
            setTimeout(() => {
              setNoVideoMessage(null);
              setCurrentSchedule(nextSchedule);
              setNextSchedule(null);
            }, timeUntilNextStart);
          } else {
            // Start the next video immediately if its time has already passed
            setNoVideoMessage(null);
            setCurrentSchedule(nextSchedule);
            setNextSchedule(null);
          }
        } else {
          setNoVideoMessage("No video is scheduled at this time.");
          setCurrentSchedule(null);
        }
      };

      // Add event listeners
      videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
      videoRef.current.addEventListener('ended', handleEnded);

      // Cleanup: Remove event listeners if the videoRef is available
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('timeupdate', handleTimeUpdate);
          videoRef.current.removeEventListener('ended', handleEnded);
        }
      };
    }
  }, [videoRef.current, currentSchedule, nextSchedule]);

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
          {currentSchedule || videoCompletedMessage ? (
            <>
              <iframe
                ref={videoRef}
                src={`https://www.youtube.com/embed/${new URL(currentSchedule?.videoUrl || nextSchedule?.videoUrl).searchParams.get('v')}?autoplay=1&start=${Math.floor((new Date().getTime() - new Date(currentSchedule?.startTime || nextSchedule?.startTime).getTime()) / 1000)}&playsinline=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="video-iframe"
              ></iframe>
              {videoCompletedMessage && <div className="video-completed-message"><h1>{videoCompletedMessage}</h1></div>}
            </>
          ) : (
            <div className="no-video-message">
              <h1>No video is scheduled at this time.</h1>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;