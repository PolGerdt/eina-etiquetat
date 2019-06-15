import './VideoScroller.css'

import React, { useState, useEffect, useRef, useCallback } from 'react'

import { Button } from '@material-ui/core'
import Slider from '@material-ui/lab/Slider'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'

const Mousetrap = require('mousetrap')

const framePeriod = 1 / 30

export default function VideoScroller({ videoSrc, onVideoTimeChange, onVideoDurationChange }) {

  const [videoTime, setVideoTime] = useState(0)

  // If time is changed send onVideoTimeChange event up
  useEffect(() => {
    onVideoTimeChange(videoTime)
  }, [videoTime, onVideoTimeChange])

  function onInputRange(v) {
    setVideoTime(v)
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
    if (videoSrc) {
      videoEl.current.src = videoSrc
      videoEl.current.load()
      setVideoTime(0)
    }
  }, [videoSrc])

  // Set video time to current state
  useEffect(() => {
    videoEl.current.currentTime = videoTime
  }, [videoTime])

  // Steps are aproximately frames
  const backwardSteps = useCallback(
    (num = 1) => {
      setVideoTime(current => Math.max(current - num * framePeriod, 0))
    },
    [],
  )

  const forwardSteps = useCallback(
    (num = 1) => {
      setVideoTime(current => Math.min(current + num * framePeriod, videoDuration))
    },
    [videoDuration],
  )

  // Shortcuts
  useEffect(() => {
    Mousetrap.bind('left', () => backwardSteps(1), 'keydown')
    Mousetrap.bind('right', () => forwardSteps(1), 'keydown')
    Mousetrap.bind(['ctrl+left', 'command+left'], () => backwardSteps(30), 'keydown')
    Mousetrap.bind(['ctrl+right', 'command+right'], () => forwardSteps(30), 'keydown')

    return () => {
      Mousetrap.unbind('left')
      Mousetrap.unbind('right')
      Mousetrap.unbind(['ctrl+left', 'command+left'])
      Mousetrap.unbind(['ctrl+right', 'command+right'])
    }
  }, [backwardSteps, forwardSteps])

  return (
    <div className="VideoScroller">
      <video
        ref={videoEl}
        src={videoSrc}
        preload="metadata"
        onDurationChange={onDurationChange}
      />

      <div className="video-controls">
        <div>
          <Button variant="contained" color="default" onClick={() => backwardSteps(1)}>
            <ChevronLeftIcon />
          </Button>
          <Button variant="contained" color="default" onClick={() => forwardSteps(1)}>
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
