import './LabelScene.css'

import React, { useState, useEffect, useRef } from 'react'
import SidePanel from '../../components/SidePanel/SidePanel'
import Main from '../../components/Main/Main'
import CandidateVideoCard from '../../components/CandidateVideoCard/CandidateVideoCard'
import TimeLabel from '../../components/TimeLabel/TimeLabel'

const Store = require('electron-store')

const store = new Store()


export default function LabelScene({
  downloadedVideosData, videoUrls,
  assignedVideoLabels,
  projectLabels, onAddProjectLabel, onDeleteProjectLabel,
  onAssignLabel, onDeleteAssignedLabel,
  onClickSaveLabels
}) {

  const [currentVideoId, setCurrentVideoId] = useState(downloadedVideosData[0].youtubeData.id)

  const videoRef = useRef({})

  const [vidPercent, setVidPercent] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)
  useEffect(() => {
    function onLodedVideoMetadata() {
      setVideoDuration(videoEl.duration)
      setVidPercent(0)
    }

    const videoEl = videoRef.current

    videoEl.addEventListener('loadedmetadata', onLodedVideoMetadata)

    return () => {
      videoEl.removeEventListener('loadedmetadata', onLodedVideoMetadata)
    }
  }, [videoRef.current.duration])

  function onVideoClick(videoId) {
    setCurrentVideoId(videoId)
    rangeRef.current.value = 0
    videoRef.current.load()
  }

  const rangeRef = useRef({})

  useEffect(() => {
    function onRangeInput() {
      let vidTime = rangeRef.current.value
      setVidPercent(vidTime)
    }

    const currentRange = rangeRef.current

    currentRange.addEventListener('input', onRangeInput)

    return () => {
      currentRange.removeEventListener('input', onRangeInput)
    }
  }, [])

  useEffect(() => {
    videoRef.current.currentTime = vidPercent * videoDuration
  }, [vidPercent, videoDuration])

  /*const [isPlaying, setIsPlaying] = useState()
  function onPlayClick() {
    videoRef.current.play()
    setIsPlaying(true)
  }

  function onPauseClick() {
    videoRef.current.pause()
    setIsPlaying(false)
  }*/

  // Labels for current video
  const [openLabels, setOpenLabels] = useState([])
  /*
  [
    {id, name, inPct, outPct}
  ]
  */

  const currentVideoAssignedLabels = assignedVideoLabels.find(videoLabels => videoLabels.videoId === currentVideoId).labels

  function onLabelClick(name) {
    const openLabelIndex = openLabels
      .findIndex(label => (label.name === name && label.outPct === undefined))

    const hasOpenLabel = openLabelIndex !== -1
    if (hasOpenLabel) {
      // Close label and send it to the App
      const openLabel = openLabels[openLabelIndex]

      // If vidPercent is bigger than inPercent swap inPct with outPct
      const closedLabel = (vidPercent > openLabel.inPct) ?
        { ...openLabel, outPct: vidPercent } :
        { ...openLabel, inPct: vidPercent, outPct: openLabel.inPct }

      onAssignLabel(currentVideoId, closedLabel)

      setOpenLabels(previous => previous.filter((label, i) => i !== openLabelIndex))
    } else {
      // Create new label
      setOpenLabels(previous => {
        const nextId = store.get('last-label-id', 0)
        store.set('last-label-id', nextId + 1)

        return [
          { id: nextId, name, inPct: vidPercent, outPct: undefined },
          ...previous
        ]
      })

    }
  }

  function deleteAssignedLabel(labelId) {
    setOpenLabels(previous => previous.filter(label => label.id !== labelId))
    onDeleteAssignedLabel(currentVideoId, labelId)
  }

  function onSubmitAddProjectLabel(e) {
    e.preventDefault()
    let name = e.target.querySelector('input').value
    onAddProjectLabel(name)

    e.target.querySelector('input').value = ''
  }

  function onClickDeleteProjectLabel(name) {
    setOpenLabels(previous => previous.filter(label => label.name !== name))
    onDeleteProjectLabel(name)
  }

  function onLabelsFinish() {
    console.log(assignedVideoLabels)
  }

  const isLabelOpen = (labelName) => (openLabels.findIndex(label => label.name === labelName) !== -1)

  return (
    <div className="LabelScene">
      <SidePanel>
        <h2>Downloaded videos</h2>

        {downloadedVideosData.map(loadedVideoData =>
          <div
            style={{ marginTop: '1em' }}
            onClick={() => onVideoClick(loadedVideoData.youtubeData.id)}
            key={loadedVideoData.youtubeData.id}>
            <CandidateVideoCard
              videoData={loadedVideoData}
              onRequestDownload={() => null}
              onCancelDownload={() => null}
            />
          </div>
        )}
      </SidePanel>

      <Main>
        <div className="main-label">
          <video
            ref={videoRef}
            preload="auto"
          >
            {currentVideoId ?
              <source src={videoUrls[currentVideoId]} type="video/mp4"></source>
              :
              null
            }
          </video>

          <div className="video-controls">
            {/*
              isPlaying ?
                <button onClick={onPauseClick}>||</button>
                :
                <button onClick={onPlayClick}>►</button>
            */}

            <input
              className="video-range"
              ref={rangeRef}
              type="range"
              min="0" max="1" step="0.001"
              defaultValue="0"
            ></input>
          </div>

          <div className="choose-label-list">
            {
              projectLabels.map((name, i) =>
                <button key={i} onClick={() => onLabelClick(name)}>
                  {
                    isLabelOpen(name) ?
                      `${name} ]` :
                      `[ ${name}`
                  }
                </button>
              )
            }
          </div>


          <div className="labels-list">
            {
              openLabels.map((label, i) =>
                <TimeLabel
                  label={{ ...label, outPct: vidPercent }}
                  isOpen={true}
                  onClickDelete={() => deleteAssignedLabel(label.id)}
                  key={i}
                />
              )
            }
            {
              currentVideoAssignedLabels.map((label, i) =>
                <TimeLabel
                  label={label}
                  isOpen={false}
                  onClickDelete={() => deleteAssignedLabel(label.id)}
                  key={i}
                />
              )
            }
          </div>

          <button onClick={onLabelsFinish}>Finished</button>

        </div>
      </Main>

      <SidePanel>
        <h3>Project Labels</h3>
        <form onSubmit={onSubmitAddProjectLabel}>
          <label>
            Add project label
            <input type="text" placeholder="New Label"></input>
          </label>
        </form>
        {
          projectLabels.map((name) =>
            <div key={name}>
              <p>{name}</p>
              <button onClick={() => onClickDeleteProjectLabel(name)}>X</button>
            </div>
          )
        }
        <h3>Assigned Labels</h3>
        <button onClick={onClickSaveLabels}>Save Assigned Labels</button>
      </SidePanel>
    </div >
  )
}
