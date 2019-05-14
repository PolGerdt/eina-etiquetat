import './VideoScroller.css'

import React, { useState, useEffect, useRef } from 'react'

export default function VideoScroller({ videoSrc, onTimeChange }) {

  const [videoDuration, setVideoDuration] = useState(0.01)
  const [videoTime, setVideoTime] = useState(0)

  function onInputRange(e) {
    const percent = e.target.value
    const time = percent * videoDuration

    setVideoTime(time)

    onTimeChange({ time, percent })
  }

  // When src is changed, load the video and set time to start
  useEffect(() => {
    videoEl.current.src = videoSrc
    videoEl.current.load()

    setVideoTime(0)
  }, [videoSrc])

  // Set video time to current state
  const videoEl = useRef(null)
  useEffect(() => {
    videoEl.current.currentTime = videoTime
  }, [videoTime])

  // Set range time to current state
  const inputEl = useRef(null)
  useEffect(() => {
    inputEl.current.value = videoTime / videoDuration
  }, [videoTime, videoDuration])

  return (
    <div className="VideoScroller">
      <video
        ref={videoEl}
        src={videoSrc}
        preload="auto"
        onDurationChange={(e) => setVideoDuration(e.target.duration)}
        //onTimeUpdate={(e) => setVideoTime(e.target.currentTime)}
      />

      <div className="video-controls">
        <input
          ref={inputEl}
          className="video-range"
          type="range"
          min="0" max="1" step="0.001"
          defaultValue="0"
          onInput={onInputRange}
        />
      </div>
    </div>
  )
}
