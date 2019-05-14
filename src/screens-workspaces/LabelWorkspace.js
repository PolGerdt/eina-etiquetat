import './LabelWorkspace.css'

import React, { useState } from 'react'
import SidePanel from '../components/SidePanel'
import Main from '../components/Main'
import VideoScroller from '../components/VideoScroller'
import CandidateVideoCard from '../components/CandidateVideoCard'
import TimeLabel from '../components/TimeLabel'

import JsonDB from 'node-json-db'

const { app } = require('electron').remote
const path = require('path')

let projectDataDb = new JsonDB(path.join(app.getPath('userData'), 'projectData.json'), true, false)

export default function LabelWorkspace({
  downloadedVideosData, videoUrls,
  assignedVideoLabels,
  projectLabels,
  onAssignLabel, onDeleteAssignedLabel,
  onClickExportLabels
}) {

  const [currentVideoId, setCurrentVideoId] = useState(downloadedVideosData[0].youtubeData.id)

  const [videoTime, setVideoTime] = useState({ time: 0, percent: 0 })

  // Labels for current video
  const [openLabels, setOpenLabels] = useState([])
  /*
  [
    {id, name, inPct, outPct}
  ]
  */

  const currentVideoAssignedLabelsInfo = assignedVideoLabels.find(videoLabels => videoLabels.videoId === currentVideoId)
  const currentVideoAssignedLabels = currentVideoAssignedLabelsInfo ? currentVideoAssignedLabelsInfo.labels : []

  function onLabelClick(name) {
    const openLabelIndex = openLabels
      .findIndex(label => (label.name === name && label.outPct === undefined))

    const hasOpenLabel = openLabelIndex !== -1
    if (hasOpenLabel) {
      // Close label and send it to the App
      const openLabel = openLabels[openLabelIndex]

      // If vidPercent is bigger than inPercent swap inPct with outPct
      const closedLabel = (videoTime.percent > openLabel.inPct) ?
        { ...openLabel, outPct: videoTime.percent } :
        { ...openLabel, inPct: videoTime.percent, outPct: openLabel.inPct }

      onAssignLabel(currentVideoId, closedLabel)

      setOpenLabels(previous => previous.filter((label, i) => i !== openLabelIndex))
    } else {
      // Create new label
      setOpenLabels(previous => {
        const nextId = projectDataDb.getData('/lastLabelId')
        projectDataDb.push('/lastLabelId', nextId + 1)

        return [
          { id: nextId, name, inPct: videoTime.percent, outPct: undefined },
          ...previous
        ]
      })

    }
  }

  function deleteAssignedLabel(labelId) {
    setOpenLabels(previous => previous.filter(label => label.id !== labelId))
    onDeleteAssignedLabel(currentVideoId, labelId)
  }

  function onLabelsFinish() {
    console.log(assignedVideoLabels)
  }

  const isLabelOpen = (labelName) => (openLabels.findIndex(label => label.name === labelName) !== -1)

  return (
    <div className="LabelWorkspace">
      <SidePanel>
        <h2>Downloaded videos</h2>

        {downloadedVideosData.map(loadedVideoData =>
          <div
            style={{ marginTop: '1em' }}
            key={loadedVideoData.youtubeData.id}>
            <CandidateVideoCard
              videoData={loadedVideoData}
              onClick={() => setCurrentVideoId(loadedVideoData.youtubeData.id)}
            />
          </div>
        )}
      </SidePanel>

      <Main>
        <div className="main-label">

          <VideoScroller videoSrc={videoUrls[currentVideoId]} onTimeChange={setVideoTime} />

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
                  label={{ ...label, outPct: videoTime.percent }}
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
        {
          projectLabels.map((name) =>
            <div key={name}>
              <p>{name}</p>
            </div>
          )
        }
        <h3>Assigned Labels</h3>
        <button onClick={onClickExportLabels}>Export Assigned Labels</button>
      </SidePanel>
    </div >
  )
}
