import './LabelWorkspace.css'

import React, { useState, useEffect, useCallback, useRef } from 'react'

import { Typography, Button, Chip } from '@material-ui/core'
import LabelIcon from '@material-ui/icons/Label'
import CheckIcon from '@material-ui/icons/Check'

import SidePanel from '../components/SidePanel'
import Main from '../components/Main'
import VideoScroller from '../components/VideoScroller'
import VideoCard from '../components/VideoCard'
import TimeLabel from '../components/TimeLabel'

import JsonDB from 'node-json-db'

const { app } = require('electron').remote
const path = require('path')

let projectDataDb = undefined

const Mousetrap = require('mousetrap')

export default function LabelWorkspace({
  downloadedVideosData, videoUrls,
  assignedVideoLabels,
  projectLabels,
  onAssignLabel, onDeleteAssignedLabel,
  onVideoLabelsDone,
  onClickExportLabels
}) {

  if (!projectDataDb)
    projectDataDb = new JsonDB(path.join(app.getPath('userData'), 'projectData.json'), true, false)

  const nextVideoLabels = assignedVideoLabels.find(videoLabels => !videoLabels.isDone)

  const [currentVideoId, setCurrentVideoId] = useState(nextVideoLabels ? nextVideoLabels.videoId : '')

  // Labels for current video
  const [openLabels, setOpenLabels] = useState([])
  /*
  [
    {id, labelName, inTime, outTime}
  ]
  */

  const currentVideoAssignedLabelsInfo = assignedVideoLabels.find(videoLabels => videoLabels.videoId === currentVideoId)
  const currentVideoAssignedLabels = currentVideoAssignedLabelsInfo ? currentVideoAssignedLabelsInfo.labels : []

  const [videoTime, setVideoTime] = useState(0)
  function onVideoTimeChange(time) {
    setVideoTime(time)
  }

  const [currentVideoDuration, setCurrentVideoDuration] = useState(0.01)
  function onVideoDurationChange(videoDuration) {
    setCurrentVideoDuration(videoDuration)
  }

  const onLabelClick = useCallback(
    (name) => {
      const openLabelIndex = openLabels
        .findIndex(label => (label.labelName === name && label.outTime === undefined))

      const hasOpenLabel = openLabelIndex !== -1
      if (hasOpenLabel) {
        // Close label and send it to the App
        const openLabel = openLabels[openLabelIndex]

        // If videoTime is bigger than inTime swap inTime with outTime
        const closedLabel = (videoTime > openLabel.inTime) ?
          { ...openLabel, outTime: videoTime } :
          { ...openLabel, inTime: videoTime, outTime: openLabel.inTime }

        onAssignLabel(currentVideoId, closedLabel)

        setOpenLabels(previous => previous.filter((label, i) => i !== openLabelIndex))
      } else {
        // Create new label
        setOpenLabels(previous => {
          const updatedLabels = [
            { id: Date.now(), labelName: name, inTime: videoTime, outTime: undefined },
            ...previous
          ]

          return updatedLabels
        })

      }
    },
    [currentVideoId, onAssignLabel, openLabels, videoTime],
  )

  function deleteAssignedLabel(labelId) {
    setOpenLabels(previous => previous.filter(label => label.id !== labelId))
    onDeleteAssignedLabel(currentVideoId, labelId)
  }

  const onLabelsFinish = useCallback(
    () => {
      const nextVideoLabels = assignedVideoLabels.find(videoLabels => !videoLabels.isDone && videoLabels.videoId !== currentVideoId)

      if (nextVideoLabels !== undefined) {
        setCurrentVideoId(nextVideoLabels.videoId)
      }

      onVideoLabelsDone(currentVideoId)
    },
    [assignedVideoLabels, onVideoLabelsDone, currentVideoId]
  )

  const isVideoDone = (videoId) => assignedVideoLabels.find(assignedLabels => assignedLabels.videoId === videoId && assignedLabels.isDone)
  const isLabelOpen = (labelName) => (openLabels.findIndex(label => label.labelName === labelName) !== -1)

  useEffect(() => {
    const firstNineLabels = projectLabels.filter((v, i) => i < 9)
    firstNineLabels.forEach((label, i) => {
      Mousetrap.bind((i + 1).toString(), () => onLabelClick(label))
    })

    Mousetrap.bind(['ctrl+d', 'command+d'], () => onLabelsFinish())

    return () => {
      firstNineLabels.forEach((label, i) => {
        Mousetrap.unbind((i + 1).toString())
      })

      Mousetrap.unbind(['ctrl+d', 'command+d'])
    }
  }, [projectLabels, onLabelClick, onLabelsFinish])

  return (
    <div className="LabelWorkspace">
      <SidePanel>
        <Typography variant="h5" component="h2" gutterBottom> Downloaded videos </Typography>

        {
          downloadedVideosData.map(loadedVideoData =>
            <div
              style={{ marginTop: '1em' }}
              key={loadedVideoData.youtubeData.id}>
              <VideoCard
                borderColor={isVideoDone(loadedVideoData.youtubeData.id) ? '#33f' : '#333'}
                videoData={loadedVideoData}
                onClick={() => setCurrentVideoId(loadedVideoData.youtubeData.id)}
              />
            </div>
          )
        }
      </SidePanel>

      <Main>
        <div className="main-label">

          <div className="fixed-top">
            <VideoScroller
              videoSrc={videoUrls[currentVideoId]}
              onVideoTimeChange={onVideoTimeChange}
              onVideoDurationChange={onVideoDurationChange}
            />

            <div className="choose-label-list">
              {
                projectLabels.map((labelName, i) =>
                  <Chip
                    key={i}
                    icon={isLabelOpen(labelName) ? <CheckIcon /> : <LabelIcon />}
                    color={isLabelOpen(labelName) ? 'secondary' : 'default'}
                    label={labelName}
                    onClick={() => onLabelClick(labelName)}
                  />
                )
              }
            </div>
          </div>

          <div className="scroll-bottom">
            <div className="labels-list">
              {
                openLabels.map((label, i) =>
                  <TimeLabel
                    totalTime={currentVideoDuration}
                    label={{ ...label, outTime: videoTime }}
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

          <Button
            variant="contained"
            color="secondary"
            disabled={currentVideoAssignedLabelsInfo.isDone}
            onClick={onLabelsFinish}
            fullWidth
          >
            Finished
            </Button>

        </div>

      </Main>

      <SidePanel>
        <Typography variant="h5" component="h2" gutterBottom> Assigned Labels </Typography>
        <Button variant="contained" color="secondary" onClick={onClickExportLabels} > Export Assigned Labels </Button>
      </SidePanel>
    </div >
  )
}
