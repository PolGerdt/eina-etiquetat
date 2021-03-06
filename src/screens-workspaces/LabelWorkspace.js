import './LabelWorkspace.css'

import React, { useState, useEffect, useCallback, useMemo } from 'react'

import { Typography, Button, Chip, Divider, Switch, FormControlLabel, TextField, Paper, Grid } from '@material-ui/core'
import LabelIcon from '@material-ui/icons/Label'
import CheckIcon from '@material-ui/icons/Check'
import DeleteForeverIcon from '@material-ui/icons/DeleteForever'
import SaveAltIcon from '@material-ui/icons/SaveAlt'

import SidePanel from '../components/SidePanel'
import MainPanel from '../components/MainPanel'
import VideoScroller from '../components/VideoScroller'
import VideoCard from '../components/VideoCard'
import TimeLabel from '../components/TimeLabel'

const Mousetrap = require('mousetrap')

export default function LabelWorkspace({
  downloadedVideosData, videoUrls, thumbnailUrls,
  assignedVideoLabels,
  projectLabels,
  isOneLabelMode,
  onAssignLabel, onDeleteAssignedLabel,
  onVideoLabelsDone,
  onClickExportLabels, 
  onClickTrimSegments, 
  extractFps, extractNum,
  onChangeExtractFps, onChangeExtractNum,
  onClickExtractFramesFps, onClickExtractNFrames,
  onClickOneLabelMode,
  onDeleteVideo
}) {

  const nextVideoLabels = assignedVideoLabels.find(videoLabels => !videoLabels.isDone)

  const [currentVideoId, setCurrentVideoId] = useState(nextVideoLabels ? nextVideoLabels.videoId : '')

  // When current video is changed scroll to view
  useEffect(() => {
    if (currentVideoId) {
      document.getElementById('dv' + currentVideoId).scrollIntoView(true) //{ behavior: "smooth", block: "end", inline: "nearest" }
    }
  }, [currentVideoId])

  // Labels for current video
  const [openLabels, setOpenLabels] = useState([])
  /*
  [
    {id, labelName, inTime, outTime}
  ]
  */

  const currentVideoAssignedLabelsInfo = assignedVideoLabels.find(videoLabels => videoLabels.videoId === currentVideoId)
  const currentVideoAssignedLabels = currentVideoAssignedLabelsInfo ? currentVideoAssignedLabelsInfo.labels : []

  const [currentVideoTime, setCurrentVideoTime] = useState(0)
  function onVideoTimeChange(time) {
    setCurrentVideoTime(time)
  }

  const [currentVideoDuration, setCurrentVideoDuration] = useState(0.01)
  function onVideoDurationChange(videoDuration) {
    setCurrentVideoDuration(videoDuration)
  }

  // Delete last open label and trigger assigned labels update to not done
  const deleteLastOpenLabel = useCallback(
    () => {
      setOpenLabels(previous => previous.filter((label, i) => i > 0))
    }, []
  )

  const onLabelClick = useCallback(
    (name) => {
      if (isOneLabelMode) {
        onAssignLabel(currentVideoId, { id: Date.now(), labelName: name, inTime: 0, outTime: currentVideoDuration })
      } else {
        const openLabelIndex = openLabels.findIndex(label => (label.labelName === name && label.outTime === undefined))

        const hasOpenLabel = openLabelIndex !== -1
        if (hasOpenLabel) {
          // Close label and send it to the App
          const openLabel = openLabels[openLabelIndex]

          // If videoTime is bigger than inTime swap inTime with outTime
          const closedLabel = (currentVideoTime > openLabel.inTime) ?
            { ...openLabel, outTime: currentVideoTime } :
            { ...openLabel, inTime: currentVideoTime, outTime: openLabel.inTime }

          onAssignLabel(currentVideoId, closedLabel)

          // Remove closed openLabel
          setOpenLabels(previous => previous.filter((label, i) => i !== openLabelIndex))
        } else {
          // Create new label
          setOpenLabels(previous => {
            const updatedLabels = [
              { id: Date.now(), labelName: name, inTime: currentVideoTime, outTime: undefined },
              ...previous
            ]

            return updatedLabels
          })

        }
      }
    }, [currentVideoId, onAssignLabel, openLabels, isOneLabelMode, currentVideoDuration, currentVideoTime]
  )

  function deleteAssignedLabel(labelId) {
    setOpenLabels(previous => previous.filter(label => label.id !== labelId))
    onDeleteAssignedLabel(currentVideoId, labelId)
  }

  function onChangeLabelMode(e) {
    onClickOneLabelMode(e.target.checked)
  }

  const loadPrevVideo = useCallback(
    () => {
      const currentVideoIndex = assignedVideoLabels.findIndex(videoLabels => videoLabels.videoId === currentVideoId)
      const nextVideoIndex = Math.max(0, currentVideoIndex - 1)
      setCurrentVideoId(assignedVideoLabels[nextVideoIndex].videoId)
    },
    [currentVideoId, assignedVideoLabels]
  )

  const loadNextVideo = useCallback(
    () => {
      const currentVideoIndex = assignedVideoLabels.findIndex(videoLabels => videoLabels.videoId === currentVideoId)
      const nextVideoIndex = Math.min(assignedVideoLabels.length - 1, currentVideoIndex + 1)
      setCurrentVideoId(assignedVideoLabels[nextVideoIndex].videoId)
    },
    [currentVideoId, assignedVideoLabels]
  )

  // Checks the next video not done and sets the current video
  const loadNextVideoNoLabels = useCallback(
    () => {
      const nextVideoLabels = assignedVideoLabels.find(videoLabels => !videoLabels.isDone && videoLabels.videoId !== currentVideoId)

      if (nextVideoLabels !== undefined) {
        setCurrentVideoId(nextVideoLabels.videoId)
      }
    },
    [currentVideoId, assignedVideoLabels]
  )

  const onLabelsFinish = useCallback(
    () => {
      onVideoLabelsDone(currentVideoId)
      loadNextVideoNoLabels()
    },
    [currentVideoId, loadNextVideoNoLabels, onVideoLabelsDone]
  )

  // Callback to delete video and load next if playing
  const onClickDeleteVideo = useCallback(
    (videoId) => {
      onDeleteVideo(videoId)

      if (currentVideoId === videoId) {
        loadNextVideoNoLabels()
      }
    }
    , [onDeleteVideo, currentVideoId, loadNextVideoNoLabels])

  const isVideoDone = useCallback(
    (videoId) => assignedVideoLabels.find(assignedLabels => assignedLabels.videoId === videoId && assignedLabels.isDone)
    , [assignedVideoLabels])

  const isLabelOpen = (labelName) => (openLabels.findIndex(label => label.labelName === labelName) !== -1)

  useEffect(() => {
    const firstNineLabels = projectLabels.filter((v, i) => i < 9)
    firstNineLabels.forEach((label, i) => {
      Mousetrap.bind((i + 1).toString(), () => onLabelClick(label))
    })

    return () => {
      firstNineLabels.forEach((label, i) => {
        Mousetrap.unbind((i + 1).toString())
      })
    }
  }, [onLabelClick, projectLabels])

  useEffect(() => {
    Mousetrap.bind(['ctrl+f', 'command+f'], () => onLabelsFinish())
    Mousetrap.bind(['ctrl+x', 'command+x'], () => deleteLastOpenLabel())
    Mousetrap.bind(['ctrl+up', 'command+up'], () => loadPrevVideo())
    Mousetrap.bind(['ctrl+down', 'command+down'], () => loadNextVideo())

    return () => {
      Mousetrap.unbind(['ctrl+f', 'command+f'])
      Mousetrap.unbind(['ctrl+x', 'command+x'])
      Mousetrap.unbind(['ctrl+up', 'command+up'])
      Mousetrap.unbind(['ctrl+down', 'command+down'])
    }
  }, [onLabelsFinish, deleteLastOpenLabel, loadPrevVideo, loadNextVideo])

  // Memoized downloaded videos list to optimize use
  const downloadedVideoCards = useMemo(
    () => {
      return downloadedVideosData.map(loadedVideoData => {
        const videoId = loadedVideoData.youtubeData.id

        let icon = 'none'
        if (videoId === currentVideoId) {
          icon = 'playing'
        } else if (isVideoDone(videoId)) {
          icon = 'done'
        }

        return (
          <div
            id={'dv' + videoId}
            className="bottom-margin"
            key={videoId}
          >
            <VideoCard
              videoData={loadedVideoData}
              onClick={() => setCurrentVideoId(videoId)}
              thumbnailPath={thumbnailUrls[videoId]}
              iconType={icon}
              showDarkOverlay={icon !== null}
            />

            <Button
              variant="contained" color="secondary"
              onClick={() => onClickDeleteVideo(videoId)}
              fullWidth
            >
              <DeleteForeverIcon className="margin-right" />
              Delete
            </Button>
          </div>
        )
      })
    }, [downloadedVideosData, isVideoDone, onClickDeleteVideo, thumbnailUrls, currentVideoId])

  return (
    <div className="LabelWorkspace">
      <SidePanel>
        <Typography variant="h5" component="h2" gutterBottom> Downloaded videos </Typography>

        {downloadedVideoCards}
      </SidePanel>

      <MainPanel>
        <div className="main-label">
          <Paper className="fixed-top">
            <VideoScroller
              videoSrc={videoUrls[currentVideoId]}
              onVideoTimeChange={onVideoTimeChange}
              onVideoDurationChange={onVideoDurationChange}
            />

            <div className="choose-label-list">
              {
                projectLabels.map((labelName, i) =>
                  <Chip
                    className="label-chip"
                    key={i}
                    icon={isLabelOpen(labelName) ? <CheckIcon /> : <LabelIcon />}
                    color={(isLabelOpen(labelName) || isOneLabelMode) ? 'secondary' : 'default'}
                    label={`${labelName} [${i + 1}]`}
                    onClick={() => onLabelClick(labelName)}
                  />
                )
              }
            </div>
          </Paper>

          <div className="scroll-bottom">
            <div className="labels-list">
              {
                openLabels.map((label, i) =>
                  <TimeLabel
                    totalTime={currentVideoDuration}
                    label={{ ...label, outTime: currentVideoTime }}
                    isOpen={true}
                    onClickDelete={() => deleteAssignedLabel(label.id)}
                    key={i}
                  />
                )
              }
              {
                currentVideoAssignedLabels.map((label, i) =>
                  <TimeLabel
                    totalTime={currentVideoDuration}
                    label={label}
                    isOpen={false}
                    onClickDelete={() => deleteAssignedLabel(label.id)}
                    key={i}
                  />
                )
              }

            </div>
          </div>

          <div className="finish-btn">
            <Button variant="contained" color="secondary"
              disabled={currentVideoAssignedLabelsInfo ? currentVideoAssignedLabelsInfo.isDone : true}
              onClick={onLabelsFinish}
              fullWidth
            >
              <CheckIcon className="margin-right" />
              Finished
            </Button>
          </div>

        </div>
      </MainPanel>

      <SidePanel>
        <Typography variant="h5" component="h2" gutterBottom> Label mode </Typography>
        <Typography variant="body1" gutterBottom> Set a label for the full video with one click. </Typography>
        <FormControlLabel
          control={
            <Switch checked={isOneLabelMode} onChange={onChangeLabelMode} color="secondary" />
          }
          label="One label mode"
        />

        <div className="side-panel-divider">
          <Divider variant="fullWidth" />
        </div>

        <Typography variant="h5" component="h2" gutterBottom> Labels </Typography>
        <Typography variant="body1" gutterBottom> Export Assigned Labels in JSON format. </Typography>
        <Button variant="contained" color="secondary" onClick={onClickExportLabels} >
          <SaveAltIcon className="margin-right" />
          Export
        </Button>

        <div className="side-panel-divider">
          <Divider variant="fullWidth" />
        </div>

        <Typography variant="h5" component="h2" gutterBottom> Video </Typography>

        <Typography variant="body1" gutterBottom> Trim segments from videos with finished labels. </Typography>
        <Button variant="contained" color="secondary" onClick={onClickTrimSegments} > Trim segments </Button>

        <div className="vertical-space"></div>

        <Typography variant="body1" gutterBottom> Extract frames from segments of videos with finished labels at a certain framerate. </Typography>
        <Grid container direction="row" alignItems="center" spacing={8}>
          <Grid item>
            <TextField
              label="Framerate"
              value={extractFps}
              onChange={(e) => onChangeExtractFps(e.target.value)}
              type="number"
              margin="normal"
            />
          </Grid>
          <Grid item>
            <Button variant="contained" color="secondary" onClick={() => onClickExtractFramesFps(extractFps)} > Extract frames </Button>
          </Grid>

        </Grid>

        <div className="vertical-space"></div>

        <Typography variant="body1" gutterBottom> Extract N frames from each label of videos with finished labels. </Typography>
        <Grid container direction="row" alignItems="center" spacing={8}>
          <Grid item>
            <TextField
              label="Number of frames"
              value={extractNum}
              onChange={(e) => onChangeExtractNum(e.target.value)}
              type="number"
              margin="normal"
            />
          </Grid>
          <Grid item>
            <Button variant="contained" color="secondary" onClick={() => onClickExtractNFrames(extractNum)} > Extract {extractNum} frames </Button>
          </Grid>
        </Grid>
      </SidePanel>
    </div >
  )
}
