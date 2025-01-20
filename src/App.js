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
      // Fetch JSON data from the URL
      const response = await fetch('https://raw.githubusercontent.com/rajujosiah/FBGL-MINISTRIES-APP-DATA/refs/heads/main/FBGlobal%20TV%20Schedule');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      const now = new Date(); // Current date and time

      // Filter schedules for the current date
      const todaySchedules = data.filter(schedule => schedule.date === now.toISOString().split('T')[0]);

      // Find the active schedule
      const activeSchedule = todaySchedules.find(schedule => {
        const [startTime, endTime] = schedule.time_slot.split(' - ').map(time => {
          const [hours, minutes] = time.split(':');
          const slotDate = new Date(schedule.date);
          slotDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          return slotDate;
        });

        return now >= startTime && now <= endTime;
      });

      // Find the next schedule
      const upcomingSchedule = todaySchedules
        .filter(schedule => {
          const [startTime] = schedule.time_slot.split(' - ').map(time => {
            const [hours, minutes] = time.split(':');
            const slotDate = new Date(schedule.date);
            slotDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            return slotDate;
          });

          return now < startTime;
        })
        .sort((a, b) => {
          const [aStartTime] = a.time_slot.split(' - ').map(time => {
            const [hours, minutes] = time.split(':');
            const slotDate = new Date(a.date);
            slotDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            return slotDate;
          });

          const [bStartTime] = b.time_slot.split(' - ').map(time => {
            const [hours, minutes] = time.split(':');
            const slotDate = new Date(b.date);
            slotDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            return slotDate;
          });

          return aStartTime - bStartTime;
        })[0]; // Get the closest upcoming schedule

      // Update the state with the active and next schedules
      setCurrentSchedule(activeSchedule || null);
      setNextSchedule(upcomingSchedule || null);

      // Update the "no video" message
      if (!activeSchedule) {
        if (upcomingSchedule) {
          setNoVideoMessage("No video is scheduled at this time.");
        } else {
          setNoVideoMessage("No further videos are scheduled for today.");
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
        const [startTime] = currentSchedule.time_slot.split(' - ').map(time => {
          const [hours, minutes] = time.split(':');
          const slotDate = new Date(currentSchedule.date);
          slotDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          return slotDate.getTime();
        });
        const videoDuration = videoRef.current.duration || 0;
        const elapsedTime = (now - startTime) / 1000;

        if (elapsedTime > videoDuration) {
          setVideoCompletedMessage("This video has ended.");
        } else {
          setVideoCompletedMessage(null);
        }
      };

      const handleEnded = () => {
        if (nextSchedule) {
          setCurrentSchedule(nextSchedule);
          setNextSchedule(null);
          setNoVideoMessage(null);
        } else {
          setNoVideoMessage("No further videos are scheduled.");
          setCurrentSchedule(null);
        }
      };

      // Add event listeners
      videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
      videoRef.current.addEventListener('ended', handleEnded);

      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('timeupdate', handleTimeUpdate);
          videoRef.current.removeEventListener('ended', handleEnded);
        }
      };
    }
  }, [videoRef.current, currentSchedule, nextSchedule]);

  const formatTime = (timeSlot) => {
    return timeSlot;
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
            <>
              <iframe
                ref={videoRef}
                src={`https://www.youtube.com/embed/${new URL(currentSchedule.video_link).searchParams.get('v')}?autoplay=1`}
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
