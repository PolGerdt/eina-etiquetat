import './VideoScroller.css'

import React, { useState, useEffect, useRef } from 'react'

import { Button } from '@material-ui/core'
import Slider from '@material-ui/lab/Slider'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'

const framePeriod = 1 / 30

export default function VideoScroller({ videoSrc, onVideoTimeChange, onVideoDurationChange }) {

  const [videoTime, setVideoTime] = useState(0)

  function onInputRange(v) {
    setVideoTime(v)
    onVideoTimeChange(v)
  }

  const videoEl = useRef(null)

  const [videoDuration, setVideoDuration] = useState(0.01)

  function onDurationChange(e) {
    const duration = e.target.duration
    setVideoDuration(duration)
    onVideoDurationChange(duration)
  }

  // When src is changed, load the video and set time to start
  useEffect(() => {
    videoEl.current.src = videoSrc
    videoEl.current.load()

    setVideoTime(0)
  }, [videoSrc])

  // Set video time to current state
  useEffect(() => {
    videoEl.current.currentTime = videoTime
  }, [videoTime])

  function forwardStep() {
    setVideoTime(current => Math.min(current + framePeriod, videoDuration))
  }

  function backwardStep() {
    setVideoTime(current => Math.max(current - framePeriod, 0))
  }

  return (
    <div className="VideoScroller">
      <video
        ref={videoEl}
        src={videoSrc}
        preload="auto"
        onDurationChange={onDurationChange}
      />

      <div className="video-controls">
        <div>
          <Button variant="contained" color="default" onClick={backwardStep}>
            <ChevronLeftIcon />
          </Button>
          <Button variant="contained" color="default" onClick={forwardStep}>
            <ChevronRightIcon />
          </Button>
        </div>
      </div>

      <div className="video-slider">
        <Slider
          value={videoTime}
          min={0} max={videoDuration} step={framePeriod}
          onChange={(e, v) => onInputRange(v)}
        />
      </div>
    </div>
  )
}
